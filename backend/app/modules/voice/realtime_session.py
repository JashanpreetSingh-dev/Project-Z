"""Voice session manager for OpenAI Realtime API.

This module manages a single voice conversation session, coordinating
the Realtime API client with tool execution.
"""

import asyncio
import base64
import json
import logging
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from app.config import get_settings
from app.modules.calendar.service import get_calendar_adapter
from app.modules.shops.models import ShopConfig
from app.modules.voice.booking_state import BookingState
from app.modules.voice.prompts import get_system_prompt
from app.modules.voice.realtime import RealtimeClient, RealtimeEventType
from app.modules.voice.service import get_adapter_for_config
from app.modules.voice.tools import ToolRegistry

logger = logging.getLogger(__name__)


class SessionState(str, Enum):
    """State of the voice session."""

    IDLE = "idle"
    CONNECTING = "connecting"
    LISTENING = "listening"
    PROCESSING = "processing"
    SPEAKING = "speaking"
    ENDED = "ended"
    ERROR = "error"


@dataclass
class SessionMetrics:
    """Metrics for a voice session."""

    session_id: str
    start_time: float = 0.0
    end_time: float = 0.0
    total_audio_in_bytes: int = 0
    total_audio_out_bytes: int = 0
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    transcripts: list[dict[str, str]] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


class RealtimeSession:
    """Manages a single voice conversation session.

    Coordinates the OpenAI Realtime API client with tool execution,
    handling audio streaming, transcription, and function calls.
    """

    def __init__(
        self,
        shop_config: ShopConfig | None = None,
        on_audio_out: Callable[[bytes], Awaitable[None]] | None = None,
        on_transcript: Callable[[str, str], Awaitable[None]] | None = None,
        on_state_change: Callable[[SessionState], Awaitable[None]] | None = None,
        session_id: str | None = None,
        caller_phone: str | None = None,
    ):
        """Initialize the voice session.

        Args:
            shop_config: Shop configuration for tool execution.
            on_audio_out: Callback for audio output (receives PCM bytes).
            on_transcript: Callback for transcripts (role, text).
            on_state_change: Callback for state changes.
            session_id: Optional session ID for continuity.
        """
        settings = get_settings()

        self.session_id = session_id or str(uuid.uuid4())
        self.shop_config = shop_config
        self.shop_name = shop_config.name if shop_config else "Demo Auto Shop"

        # Callbacks
        self._on_audio_out = on_audio_out
        self._on_transcript = on_transcript
        self._on_state_change = on_state_change

        # Components
        self.client = RealtimeClient(
            api_key=settings.openai_api_key,
            model=settings.realtime_model,
        )
        adapter = get_adapter_for_config(shop_config)

        # Calendar integration
        calendar_adapter = get_calendar_adapter(shop_config)
        booking_state = BookingState()

        self.tools = ToolRegistry(
            adapter=adapter,
            calendar_adapter=calendar_adapter,
            booking_state=booking_state,
            shop_config=shop_config,
            caller_phone=caller_phone,
        )
        self.booking_state = booking_state

        # State
        self._state = SessionState.IDLE
        self._event_task: asyncio.Task[None] | None = None
        self._metrics = SessionMetrics(session_id=self.session_id)

        # Track pending function calls
        self._pending_function_calls: dict[str, dict[str, Any]] = {}

    @property
    def state(self) -> SessionState:
        """Get current session state."""
        return self._state

    @property
    def metrics(self) -> SessionMetrics:
        """Get session metrics."""
        return self._metrics

    async def _set_state(self, new_state: SessionState) -> None:
        """Update state and notify callback."""
        if self._state != new_state:
            logger.info("Session %s: %s -> %s", self.session_id, self._state, new_state)
            self._state = new_state
            if self._on_state_change:
                await self._on_state_change(new_state)

    async def start(self) -> None:
        """Connect and configure the session."""
        await self._set_state(SessionState.CONNECTING)

        try:
            await self.client.connect()

            # Configure session with system prompt and tools
            settings = get_settings()
            await self.client.configure_session(
                system_prompt=get_system_prompt(self.shop_name),
                tools=self.tools.get_realtime_tools_schema(),
                voice=settings.realtime_voice,
            )

            # Start event processing loop
            self._event_task = asyncio.create_task(self._event_loop())

            await self._set_state(SessionState.LISTENING)
            logger.info("Session %s started for shop: %s", self.session_id, self.shop_name)

        except Exception as e:
            logger.exception("Failed to start session: %s", e)
            self._metrics.errors.append(str(e))
            await self._set_state(SessionState.ERROR)
            raise

    async def send_audio(self, audio_chunk: bytes) -> None:
        """Forward audio from caller to OpenAI.

        Args:
            audio_chunk: Raw PCM audio bytes (16kHz, 16-bit, mono).
        """
        if not self.client.is_connected:
            logger.warning("Cannot send audio: not connected")
            return

        self._metrics.total_audio_in_bytes += len(audio_chunk)
        await self.client.send_audio(audio_chunk)

    async def send_text(self, text: str) -> None:
        """Send a text message (for testing).

        Args:
            text: The text message to send.
        """
        if not self.client.is_connected:
            logger.warning("Cannot send text: not connected")
            return

        self._metrics.transcripts.append({"role": "user", "text": text})
        await self.client.send_text_message(text)

    async def _event_loop(self) -> None:
        """Process events from OpenAI Realtime API."""
        try:
            async for event in self.client.receive():
                await self._handle_event(event)
        except asyncio.CancelledError:
            logger.info("Event loop cancelled for session %s", self.session_id)
        except Exception as e:
            logger.exception("Error in event loop: %s", e)
            self._metrics.errors.append(str(e))
            await self._set_state(SessionState.ERROR)

    async def _handle_event(self, event: Any) -> None:
        """Handle a single event from the API."""
        event_type = event.type
        data = event.data

        # Session events
        if event_type == RealtimeEventType.SESSION_CREATED:
            logger.debug("Session created: %s", data.get("session", {}).get("id"))

        elif event_type == RealtimeEventType.SESSION_UPDATED:
            logger.debug("Session updated")

        # Speech detection
        elif event_type == RealtimeEventType.SPEECH_STARTED:
            logger.debug("User started speaking")
            # If AI is speaking, cancel (barge-in)
            if self._state == SessionState.SPEAKING:
                await self.client.cancel_response()
            await self._set_state(SessionState.LISTENING)

        elif event_type == RealtimeEventType.SPEECH_STOPPED:
            logger.debug("User stopped speaking")
            await self._set_state(SessionState.PROCESSING)

        # Audio output
        elif event_type == RealtimeEventType.AUDIO_DELTA:
            await self._set_state(SessionState.SPEAKING)
            if self._on_audio_out and "delta" in data:
                audio_bytes = base64.b64decode(data["delta"])
                self._metrics.total_audio_out_bytes += len(audio_bytes)
                await self._on_audio_out(audio_bytes)

        elif event_type == RealtimeEventType.AUDIO_DONE:
            logger.debug("Audio output complete")

        # Transcription
        elif event_type == RealtimeEventType.AUDIO_TRANSCRIPT_DELTA:
            pass  # Streaming transcript, ignore for now

        elif event_type == RealtimeEventType.AUDIO_TRANSCRIPT_DONE:
            transcript = data.get("transcript", "")
            if transcript and self._on_transcript:
                self._metrics.transcripts.append({"role": "assistant", "text": transcript})
                await self._on_transcript("assistant", transcript)

        # Function calls
        elif event_type == RealtimeEventType.FUNCTION_CALL_ARGS_DONE:
            await self._handle_function_call(data)

        # Response complete
        elif event_type == RealtimeEventType.RESPONSE_DONE:
            response = data.get("response", {})
            status = response.get("status")
            if status == "completed":
                await self._set_state(SessionState.LISTENING)
            elif status == "cancelled":
                logger.debug("Response cancelled (barge-in)")
                await self._set_state(SessionState.LISTENING)

        # Errors
        elif event_type == RealtimeEventType.ERROR:
            error_msg = data.get("error", {}).get("message", "Unknown error")
            logger.error("Realtime API error: %s", error_msg)
            self._metrics.errors.append(error_msg)

    async def _handle_function_call(self, data: dict[str, Any]) -> None:
        """Execute a function call from the API.

        Args:
            data: Function call event data.
        """
        call_id = data.get("call_id", "")
        function_name = data.get("name", "")
        arguments_str = data.get("arguments", "{}")

        logger.info("Function call: %s (call_id=%s)", function_name, call_id)

        try:
            arguments = json.loads(arguments_str)
        except json.JSONDecodeError:
            logger.error("Failed to parse function arguments: %s", arguments_str)
            arguments = {}

        # Execute the tool
        try:
            result = await self.tools.execute(function_name, arguments)

            # Track metrics
            self._metrics.tool_calls.append(
                {
                    "call_id": call_id,
                    "function": function_name,
                    "arguments": arguments,
                    "result": result,
                }
            )

            # Send result back to API
            await self.client.send_function_result(call_id, result)
            logger.info("Function %s executed successfully", function_name)

        except Exception as e:
            logger.exception("Error executing function %s: %s", function_name, e)
            error_result = {"success": False, "error": str(e)}
            await self.client.send_function_result(call_id, error_result)

    async def stop(self) -> None:
        """End the session and clean up."""
        logger.info("Stopping session %s", self.session_id)

        # Clear booking state
        if hasattr(self, "booking_state") and self.booking_state:
            self.booking_state.clear()

        if self._event_task:
            self._event_task.cancel()
            try:
                await self._event_task
            except asyncio.CancelledError:
                pass
            self._event_task = None

        await self.client.close()
        await self._set_state(SessionState.ENDED)

        import time

        self._metrics.end_time = time.time()
        logger.info(
            "Session %s ended. Audio in: %d bytes, Audio out: %d bytes, Tools: %d",
            self.session_id,
            self._metrics.total_audio_in_bytes,
            self._metrics.total_audio_out_bytes,
            len(self._metrics.tool_calls),
        )


# Session storage for active sessions
_active_sessions: dict[str, RealtimeSession] = {}


def get_session(session_id: str) -> RealtimeSession | None:
    """Get an active session by ID."""
    return _active_sessions.get(session_id)


def register_session(session: RealtimeSession) -> None:
    """Register a session as active."""
    _active_sessions[session.session_id] = session


def unregister_session(session_id: str) -> None:
    """Remove a session from active sessions."""
    _active_sessions.pop(session_id, None)


async def cleanup_session(session_id: str) -> None:
    """Stop and clean up a session."""
    session = _active_sessions.pop(session_id, None)
    if session:
        await session.stop()
