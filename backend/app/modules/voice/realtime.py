"""OpenAI Realtime API WebSocket client.

This module provides a client for OpenAI's Realtime API, enabling
low-latency speech-to-speech conversations with native function calling.
"""

import asyncio
import base64
import json
import logging
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import websockets
from websockets.asyncio.client import ClientConnection

logger = logging.getLogger(__name__)


class RealtimeEventType(str, Enum):
    """Event types from OpenAI Realtime API."""

    # Session events
    SESSION_CREATED = "session.created"
    SESSION_UPDATED = "session.updated"

    # Input audio buffer events
    SPEECH_STARTED = "input_audio_buffer.speech_started"
    SPEECH_STOPPED = "input_audio_buffer.speech_stopped"
    INPUT_COMMITTED = "input_audio_buffer.committed"

    # Conversation events
    ITEM_CREATED = "conversation.item.created"

    # Response events
    RESPONSE_CREATED = "response.created"
    RESPONSE_DONE = "response.done"
    RESPONSE_CANCELLED = "response.cancelled"

    # Audio output events
    AUDIO_DELTA = "response.audio.delta"
    AUDIO_DONE = "response.audio.done"
    AUDIO_TRANSCRIPT_DELTA = "response.audio_transcript.delta"
    AUDIO_TRANSCRIPT_DONE = "response.audio_transcript.done"

    # Function call events
    FUNCTION_CALL_ARGS_DELTA = "response.function_call_arguments.delta"
    FUNCTION_CALL_ARGS_DONE = "response.function_call_arguments.done"

    # Error events
    ERROR = "error"


@dataclass
class RealtimeEvent:
    """Parsed event from the Realtime API."""

    type: str
    data: dict[str, Any] = field(default_factory=dict)
    raw: dict[str, Any] = field(default_factory=dict)


class RealtimeClient:
    """OpenAI Realtime API WebSocket client.

    Handles the WebSocket connection to OpenAI's Realtime API for
    speech-to-speech conversations with function calling support.
    """

    REALTIME_URL = "wss://api.openai.com/v1/realtime"

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-realtime-preview",
    ):
        """Initialize the Realtime client.

        Args:
            api_key: OpenAI API key.
            model: Model to use (default: gpt-4o-realtime-preview).
        """
        self.api_key = api_key
        self.model = model
        self._ws: ClientConnection | None = None
        self._connected = False
        self._receive_task: asyncio.Task[None] | None = None
        self._event_queue: asyncio.Queue[RealtimeEvent] = asyncio.Queue()

    @property
    def is_connected(self) -> bool:
        """Check if client is connected."""
        return self._connected and self._ws is not None

    async def connect(self) -> None:
        """Open WebSocket connection to OpenAI Realtime API."""
        if self._connected:
            logger.warning("Already connected to Realtime API")
            return

        url = f"{self.REALTIME_URL}?model={self.model}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "OpenAI-Beta": "realtime=v1",
        }

        logger.info("Connecting to OpenAI Realtime API...")
        self._ws = await websockets.connect(url, additional_headers=headers)
        self._connected = True

        # Start background receive task
        self._receive_task = asyncio.create_task(self._receive_loop())

        logger.info("Connected to OpenAI Realtime API")

    async def _receive_loop(self) -> None:
        """Background task to receive and queue events."""
        if not self._ws:
            return

        try:
            async for message in self._ws:
                if isinstance(message, bytes):
                    message = message.decode("utf-8")

                try:
                    data = json.loads(message)
                    event = self._parse_event(data)
                    await self._event_queue.put(event)
                except json.JSONDecodeError:
                    logger.error("Failed to parse message: %s", message[:100])
        except websockets.ConnectionClosed:
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.exception("Error in receive loop: %s", e)
        finally:
            self._connected = False

    def _parse_event(self, data: dict[str, Any]) -> RealtimeEvent:
        """Parse raw event data into RealtimeEvent."""
        event_type = data.get("type", "unknown")
        return RealtimeEvent(type=event_type, data=data, raw=data)

    async def receive(self) -> AsyncIterator[RealtimeEvent]:
        """Yield events from the API.

        Yields:
            RealtimeEvent objects as they arrive.
        """
        while self._connected or not self._event_queue.empty():
            try:
                event = await asyncio.wait_for(
                    self._event_queue.get(),
                    timeout=0.1,
                )
                yield event
            except TimeoutError:
                if not self._connected:
                    break
                continue

    async def send(self, event: dict[str, Any]) -> None:
        """Send an event to the API.

        Args:
            event: Event dictionary to send.
        """
        if not self._ws or not self._connected:
            raise ConnectionError("Not connected to Realtime API")

        await self._ws.send(json.dumps(event))

    async def configure_session(
        self,
        system_prompt: str,
        tools: list[dict[str, Any]],
        voice: str = "alloy",
        input_audio_format: str = "pcm16",
        output_audio_format: str = "pcm16",
        turn_detection: dict[str, Any] | None = None,
    ) -> None:
        """Configure the session with system prompt and tools.

        Args:
            system_prompt: The system prompt for the AI.
            tools: List of tool definitions in Realtime API format.
            voice: Voice to use (alloy, echo, fable, onyx, nova, shimmer).
            input_audio_format: Input audio format (pcm16 or g711_ulaw).
            output_audio_format: Output audio format (pcm16 or g711_ulaw).
            turn_detection: Turn detection settings (server_vad or none).
        """
        # Default turn detection: server-side VAD
        if turn_detection is None:
            turn_detection = {
                "type": "server_vad",
                "threshold": 0.5,
                "prefix_padding_ms": 300,
                "silence_duration_ms": 500,
            }

        session_config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": system_prompt,
                "voice": voice,
                "input_audio_format": input_audio_format,
                "output_audio_format": output_audio_format,
                "input_audio_transcription": {
                    "model": "whisper-1",
                },
                "turn_detection": turn_detection,
                "tools": tools,
                "tool_choice": "auto",
            },
        }

        await self.send(session_config)
        logger.info("Session configured with %d tools", len(tools))

    async def send_audio(self, audio_chunk: bytes) -> None:
        """Stream audio input to the API.

        Args:
            audio_chunk: Raw PCM audio bytes (16-bit, mono).
        """
        if not self._connected:
            raise ConnectionError("Not connected to Realtime API")

        # Encode audio as base64
        audio_b64 = base64.b64encode(audio_chunk).decode("utf-8")

        await self.send(
            {
                "type": "input_audio_buffer.append",
                "audio": audio_b64,
            }
        )

    async def commit_audio(self) -> None:
        """Commit the audio buffer to trigger processing."""
        await self.send({"type": "input_audio_buffer.commit"})

    async def clear_audio_buffer(self) -> None:
        """Clear the input audio buffer."""
        await self.send({"type": "input_audio_buffer.clear"})

    async def create_response(self) -> None:
        """Request the model to generate a response."""
        await self.send({"type": "response.create"})

    async def cancel_response(self) -> None:
        """Cancel the current response (for barge-in)."""
        await self.send({"type": "response.cancel"})

    async def send_function_result(
        self,
        call_id: str,
        result: dict[str, Any],
    ) -> None:
        """Send function execution result back to API.

        Args:
            call_id: The function call ID from the API.
            result: The result of the function execution.
        """
        # Add the function output to the conversation
        await self.send(
            {
                "type": "conversation.item.create",
                "item": {
                    "type": "function_call_output",
                    "call_id": call_id,
                    "output": json.dumps(result),
                },
            }
        )

        # Request a response after providing the function result
        await self.create_response()
        logger.debug("Sent function result for call_id=%s", call_id)

    async def send_text_message(self, text: str) -> None:
        """Send a text message (for testing without audio).

        Args:
            text: The text message to send.
        """
        await self.send(
            {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": text,
                        }
                    ],
                },
            }
        )
        await self.create_response()

    async def close(self) -> None:
        """Close the WebSocket connection."""
        self._connected = False

        if self._receive_task:
            self._receive_task.cancel()
            try:
                await self._receive_task
            except asyncio.CancelledError:
                pass
            self._receive_task = None

        if self._ws:
            await self._ws.close()
            self._ws = None

        logger.info("Disconnected from OpenAI Realtime API")
