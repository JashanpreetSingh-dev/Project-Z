"""Telephony integration via Twilio (Phase 4).

This module provides Twilio-specific handling for phone calls,
extending the base RealtimeSession with g711_ulaw audio format
and Twilio Media Streams integration.
"""

import base64
import json
import logging
import time
from typing import Any

from fastapi import APIRouter, Request, Response, WebSocket, WebSocketDisconnect

from app.config import get_settings
from app.modules.billing.service import check_quota, increment_usage
from app.modules.calls.models import CallIntent, CallLog, CallOutcome
from app.modules.context.service import update_context_from_call, update_context_from_sms
from app.modules.shops.models import ShopConfig
from app.modules.shops.service import get_shop_config_by_id, get_shop_config_by_phone
from app.modules.sms.service import SmsService
from app.modules.voice.prompts import get_system_prompt
from app.modules.voice.realtime import RealtimeEventType
from app.modules.voice.realtime_session import RealtimeSession, SessionState

logger = logging.getLogger(__name__)
router = APIRouter()

# Settings loaded once at module level
_settings = get_settings()


# =============================================================================
# Intent Mapping (could be moved to tools.py if needed elsewhere)
# =============================================================================

FUNCTION_TO_INTENT: dict[str, CallIntent] = {
    "lookup_work_order": CallIntent.CHECK_STATUS,
    "get_work_order_status": CallIntent.CHECK_STATUS,
    "get_customer_vehicles": CallIntent.CHECK_STATUS,
    "get_business_hours": CallIntent.GET_HOURS,
    "get_location": CallIntent.GET_LOCATION,
    "list_services": CallIntent.GET_SERVICES,
    "transfer_to_human": CallIntent.TRANSFER_HUMAN,
}


# =============================================================================
# TwilioRealtimeSession - Extends RealtimeSession for phone calls
# =============================================================================


class TwilioRealtimeSession(RealtimeSession):
    """RealtimeSession specialized for Twilio phone calls.

    Key differences from base RealtimeSession:
    - Uses g711_ulaw audio format (Twilio's native format, no conversion needed)
    - Sends audio directly to Twilio WebSocket
    - Handles barge-in by clearing Twilio's audio buffer
    - Logs calls to database on completion
    - Supports call transfer via Twilio REST API
    """

    def __init__(
        self,
        twilio_ws: WebSocket,
        call_sid: str,
        from_number: str,
        to_number: str,
        shop_config: ShopConfig | None = None,
    ):
        """Initialize Twilio session.

        Args:
            twilio_ws: WebSocket connection from Twilio Media Streams.
            call_sid: Twilio call SID for this call.
            from_number: Caller's phone number.
            to_number: Called phone number (your Twilio number).
            shop_config: Optional shop configuration for tools.
        """
        # Initialize base class with our callbacks
        super().__init__(
            shop_config=shop_config,
            on_audio_out=self._send_audio_to_twilio,
            on_transcript=self._record_transcript,
            session_id=call_sid,  # Use call_sid as session_id
        )

        # Twilio-specific state
        self.twilio_ws = twilio_ws
        self.call_sid = call_sid
        self.from_number = from_number
        self.to_number = to_number
        self.stream_sid: str | None = None

        # Call tracking
        self._start_time: float = 0.0
        self._should_transfer = False
        self._transfer_reason: str | None = None
        self._detected_intent: CallIntent = CallIntent.UNKNOWN
        self._transcripts: list[dict[str, str]] = []
        self._sms_sent = False  # Track if SMS has been sent to prevent duplicates

    @property
    def shop_id(self) -> str | None:
        """Get shop ID for logging."""
        if self.shop_config and self.shop_config.id:
            return str(self.shop_config.id)
        return None

    # -------------------------------------------------------------------------
    # Overridden Methods
    # -------------------------------------------------------------------------

    async def start(self) -> None:
        """Start session with g711_ulaw format for Twilio compatibility."""
        logger.info("Starting Twilio session: call=%s shop=%s", self.call_sid, self.shop_name)
        self._start_time = time.time()

        await self._set_state(SessionState.CONNECTING)

        try:
            await self.client.connect()

            # Configure with g711_ulaw - Twilio's native format (no conversion!)
            await self.client.configure_session(
                system_prompt=get_system_prompt(self.shop_name),
                tools=self.tools.get_realtime_tools_schema(),
                voice=_settings.realtime_voice,
                input_audio_format="g711_ulaw",
                output_audio_format="g711_ulaw",
            )

            # Start event processing (uses parent's _event_loop)
            import asyncio

            self._event_task = asyncio.create_task(self._event_loop())

            await self._set_state(SessionState.LISTENING)

            # Trigger AI to greet the caller immediately
            await self.client.send_text_message("The caller just connected. Greet them warmly.")
            logger.info("Greeting triggered for call %s", self.call_sid)

        except Exception as e:
            logger.exception("Failed to start Twilio session: %s", e)
            self._metrics.errors.append(str(e))
            await self._set_state(SessionState.ERROR)
            raise

    async def _handle_event(self, event: Any) -> None:
        """Handle OpenAI events with Twilio-specific barge-in support."""
        event_type = event.type
        data = event.data

        # On speech start, clear Twilio buffer for instant barge-in
        if event_type == RealtimeEventType.SPEECH_STARTED:
            if self._state == SessionState.SPEAKING:
                await self.client.cancel_response()
                await self._clear_twilio_buffer()

        # Track function calls for intent detection and transfer
        if event_type == RealtimeEventType.FUNCTION_CALL_ARGS_DONE:
            function_name = data.get("name", "")
            self._detected_intent = FUNCTION_TO_INTENT.get(function_name, CallIntent.UNKNOWN)

            # Check if this is a transfer request
            if function_name == "transfer_to_human":
                self._should_transfer = True
                try:
                    args = json.loads(data.get("arguments", "{}"))
                    self._transfer_reason = args.get("reason", "Customer requested transfer")
                except json.JSONDecodeError:
                    self._transfer_reason = "Customer requested transfer"

        # After response completes, check if we should transfer
        if event_type == RealtimeEventType.RESPONSE_DONE:
            response = data.get("response", {})
            if response.get("status") == "completed" and self._should_transfer:
                await self._execute_transfer()

        # Let parent handle the rest (audio, transcripts, function execution)
        await super()._handle_event(event)

    async def stop(self) -> None:
        """Stop session and log the call."""
        # Calculate duration before stopping
        duration = int(time.time() - self._start_time) if self._start_time else 0

        # Stop the base session
        await super().stop()

        # Log the call to database
        await self._log_call(duration)

        logger.info(
            "Call %s ended: duration=%ds, audio_in=%d bytes, audio_out=%d bytes, tools=%d",
            self.call_sid,
            duration,
            self._metrics.total_audio_in_bytes,
            self._metrics.total_audio_out_bytes,
            len(self._metrics.tool_calls),
        )

    # -------------------------------------------------------------------------
    # Twilio Message Handling
    # -------------------------------------------------------------------------

    async def handle_twilio_message(self, message: dict[str, Any]) -> None:
        """Process incoming Twilio Media Stream messages.

        Args:
            message: JSON message from Twilio WebSocket.
        """
        event = message.get("event")

        if event == "connected":
            logger.debug("Twilio stream connected")

        elif event == "start":
            self.stream_sid = message.get("start", {}).get("streamSid")
            try:
                await self.start()
            except Exception as e:
                logger.exception("Failed to start session for call %s: %s", self.call_sid, e)
                # Set error state but don't raise - allow WebSocket to stay connected
                # The call will continue but won't process audio
                await self._set_state(SessionState.ERROR)

        elif event == "media":
            # Forward audio directly to OpenAI (mulaw -> mulaw, no conversion)
            payload = message.get("media", {}).get("payload", "")
            if payload and self.client.is_connected:
                audio = base64.b64decode(payload)
                await self.send_audio(audio)

        elif event == "stop":
            await self.stop()

        elif event == "mark":
            logger.debug("Mark: %s", message.get("mark", {}).get("name"))

    # -------------------------------------------------------------------------
    # Twilio Audio Output
    # -------------------------------------------------------------------------

    async def _send_audio_to_twilio(self, audio: bytes) -> None:
        """Send audio to Twilio (callback for on_audio_out)."""
        if not self.stream_sid:
            return

        try:
            await self.twilio_ws.send_json(
                {
                    "event": "media",
                    "streamSid": self.stream_sid,
                    "media": {"payload": base64.b64encode(audio).decode()},
                }
            )
        except Exception as e:
            logger.error("Failed to send audio to Twilio: %s", e)

    async def _clear_twilio_buffer(self) -> None:
        """Clear Twilio's audio buffer (enables instant barge-in)."""
        if not self.stream_sid:
            return

        try:
            await self.twilio_ws.send_json(
                {
                    "event": "clear",
                    "streamSid": self.stream_sid,
                }
            )
        except Exception as e:
            logger.error("Failed to clear Twilio buffer: %s", e)

    async def _record_transcript(self, role: str, text: str) -> None:
        """Record transcript (callback for on_transcript)."""
        self._transcripts.append({"role": role, "text": text})

    # -------------------------------------------------------------------------
    # Call Transfer
    # -------------------------------------------------------------------------

    async def _execute_transfer(self) -> None:
        """Transfer the call to a human operator."""
        from twilio.rest import Client  # type: ignore[import-untyped]  # noqa: I001

        transfer_number = (
            self.shop_config.settings.transfer_number if self.shop_config else None
        ) or _settings.default_transfer_number

        if not transfer_number:
            logger.error("No transfer number configured for call %s", self.call_sid)
            return

        logger.info("Transferring call %s to %s", self.call_sid, transfer_number)

        try:
            client = Client(_settings.twilio_account_sid, _settings.twilio_auth_token)
            client.calls(self.call_sid).update(
                twiml=f"<Response><Say>Transferring you now.</Say><Dial>{transfer_number}</Dial></Response>"
            )
        except Exception as e:
            logger.exception("Transfer failed for call %s: %s", self.call_sid, e)

    # -------------------------------------------------------------------------
    # Call Logging
    # -------------------------------------------------------------------------

    async def _log_call(self, duration: int) -> None:
        """Save call record to database and increment usage."""
        # Determine outcome
        if self._should_transfer:
            outcome = CallOutcome.TRANSFERRED
        elif self._state == SessionState.ERROR:
            outcome = CallOutcome.FAILED
        elif self._metrics.tool_calls:
            outcome = CallOutcome.RESOLVED
        else:
            outcome = CallOutcome.ABANDONED

        # Increment usage counter for billing
        if self.shop_id:
            try:
                await increment_usage(self.shop_id)
                logger.debug("Usage incremented for shop %s", self.shop_id)
            except Exception as e:
                logger.error("Failed to increment usage for shop %s: %s", self.shop_id, e)

        try:
            call_log = CallLog(
                shop_id=self.shop_id or "unknown",
                call_sid=self.call_sid,
                caller_number=self.from_number,
                duration_seconds=duration,
                intent=self._detected_intent,
                outcome=outcome,
                tool_called=self._metrics.tool_calls[-1]["function"]
                if self._metrics.tool_calls
                else None,
                tool_results=self._metrics.tool_calls[-1].get("result", {})
                if self._metrics.tool_calls
                else {},
                transfer_reason=self._transfer_reason,
                metadata={
                    "to_number": self.to_number,
                    "tool_count": len(self._metrics.tool_calls),
                    "transcript_count": len(self._transcripts),
                },
            )
            await call_log.insert()
            logger.info("Call logged: %s", self.call_sid)

            # Update customer context (async, non-blocking)
            try:
                await update_context_from_call(call_log)
            except Exception as e:
                logger.exception("Failed to update context from call: %s", e)

            # Send SMS summary if enabled and call was resolved (async, non-blocking)
            # Guard against duplicate sends
            if (
                outcome == CallOutcome.RESOLVED
                and self.shop_id
                and self.from_number
                and not self._sms_sent
            ):
                try:
                    shop_config = await get_shop_config_by_id(self.shop_id)
                    if shop_config and shop_config.settings.sms_call_summary_enabled:
                        sms_service = SmsService()
                        # Generate summary for context (before adding opt-out message)
                        summary = sms_service.generate_call_summary(call_log, shop_config)
                        # Send SMS (this handles opt-out check and adds opt-out message)
                        sms_sent = await sms_service.send_call_summary(
                            call_log,
                            shop_config,
                            from_number=shop_config.settings.sms_from_number,
                        )
                        if sms_sent:
                            self._sms_sent = True  # Mark as sent to prevent duplicates
                            logger.info("SMS summary sent for call %s", self.call_sid)
                            # Update context with SMS (use original summary without opt-out message)
                            await update_context_from_sms(
                                self.from_number,
                                self.shop_id,
                                summary,
                            )
                        else:
                            logger.debug(
                                "SMS not sent for call %s (opted out or error)", self.call_sid
                            )
                except Exception as e:
                    logger.exception("Failed to send SMS summary: %s", e)

        except Exception as e:
            logger.exception("Failed to log call %s: %s", self.call_sid, e)


# =============================================================================
# Twilio Webhook Endpoints
# =============================================================================


def _quota_exceeded_response(shop_name: str) -> Response:
    """Generate TwiML response when quota is exceeded."""
    from twilio.twiml.voice_response import VoiceResponse  # type: ignore[import-untyped]  # noqa: I001

    response = VoiceResponse()
    response.say(
        f"Thank you for calling {shop_name}. "
        "We're experiencing high call volume and cannot take your call right now. "
        "Please try again later or visit our website for more information. Goodbye.",
        voice="Polly.Joanna",
    )
    response.hangup()
    return Response(content=str(response), media_type="application/xml")


@router.post("/incoming")
async def handle_incoming_call(request: Request) -> Response:
    """Handle incoming Twilio call webhook.

    Returns TwiML instructing Twilio to open a bidirectional media stream.
    Checks quota before accepting the call.
    """
    from twilio.twiml.voice_response import Connect, Stream, VoiceResponse  # type: ignore[import-untyped]  # noqa: I001

    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    from_number = form.get("From", "unknown")
    to_number = form.get("To", "unknown")

    logger.info("Incoming call: sid=%s from=%s to=%s", call_sid, from_number, to_number)

    # Look up shop by phone number to check quota
    shop_config = await get_shop_config_by_phone(str(to_number))

    if shop_config and shop_config.id:
        shop_id = str(shop_config.id)
        shop_name = shop_config.name

        # Check quota before accepting call
        try:
            quota = await check_quota(shop_id)
            if not quota.allowed:
                logger.warning(
                    "Quota exceeded for shop %s (%s), rejecting call %s",
                    shop_name,
                    shop_id,
                    call_sid,
                )
                return _quota_exceeded_response(shop_name)
        except Exception as e:
            # If quota check fails, allow the call (fail open for better UX)
            logger.error("Quota check failed for shop %s: %s", shop_id, e)
    else:
        shop_name = "our business"

    # Build WebSocket URL
    base_url = _settings.twilio_webhook_base_url
    if not base_url:
        host = request.headers.get("host", "localhost:8000")
        base_url = f"https://{host}"

    # Convert https:// to wss:// for WebSocket
    ws_base = base_url.replace("https://", "wss://").replace("http://", "ws://")
    ws_url = f"{ws_base}/api/twilio/media-stream"

    logger.info("Media stream URL: %s", ws_url)

    # Generate TwiML
    response = VoiceResponse()
    connect = Connect()
    stream = Stream(url=ws_url)
    stream.parameter(name="callSid", value=str(call_sid))
    stream.parameter(name="fromNumber", value=str(from_number))
    stream.parameter(name="toNumber", value=str(to_number))
    connect.append(stream)
    response.append(connect)

    return Response(content=str(response), media_type="application/xml")


@router.websocket("/media-stream")
async def twilio_media_stream(websocket: WebSocket) -> None:
    """WebSocket endpoint for Twilio Media Streams.

    Bridges Twilio audio with OpenAI Realtime API.
    """
    await websocket.accept()
    logger.info("Twilio media stream connected")

    session: TwilioRealtimeSession | None = None

    try:
        while True:
            message = json.loads(await websocket.receive_text())

            # Create session on stream start
            if message.get("event") == "start" and session is None:
                params = message.get("start", {}).get("customParameters", {})
                to_number = params.get("toNumber", "unknown")

                # Look up shop by Twilio phone number
                shop_config = await get_shop_config_by_phone(to_number)
                if shop_config:
                    logger.info("Matched shop: %s", shop_config.name)
                else:
                    logger.warning("No shop found for %s, using defaults", to_number)

                session = TwilioRealtimeSession(
                    twilio_ws=websocket,
                    call_sid=params.get("callSid", "unknown"),
                    from_number=params.get("fromNumber", "unknown"),
                    to_number=to_number,
                    shop_config=shop_config,
                )

            # Forward all messages to session
            if session:
                try:
                    await session.handle_twilio_message(message)
                except Exception as e:
                    logger.exception("Error handling Twilio message: %s", e)
                    # Don't let individual message errors disconnect the call
                    # Continue processing other messages

    except WebSocketDisconnect:
        logger.info("Twilio media stream disconnected")
    except Exception as e:
        logger.exception("Media stream error: %s", e)
    finally:
        if session:
            await session.stop()


@router.post("/status")
async def handle_call_status(request: Request) -> Response:
    """Handle Twilio call status webhooks."""
    form = await request.form()
    logger.info("Call status: sid=%s status=%s", form.get("CallSid"), form.get("CallStatus"))
    return Response(content="OK", media_type="text/plain")
