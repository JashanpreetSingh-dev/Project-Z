"""Voice API endpoints for testing the conversation engine."""

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.modules.voice.realtime_session import (
    RealtimeSession,
    SessionState,
    register_session,
    unregister_session,
)
from app.modules.voice.service import (
    clear_conversation,
    get_or_create_conversation,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================
# Request/Response Schemas
# ============================================


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    message: str = Field(..., min_length=1, description="User message to process")
    conversation_id: str | None = Field(
        default=None,
        description="Optional conversation ID for continuity",
    )
    shop_id: str | None = Field(
        default=None,
        description="Optional shop ID (uses mock data if not provided)",
    )


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""

    response: str = Field(..., description="AI response text")
    conversation_id: str = Field(..., description="Conversation ID for continuity")
    intent: str | None = Field(default=None, description="Detected intent")
    tool_called: str | None = Field(default=None, description="Last tool called")
    should_transfer: bool = Field(default=False, description="Whether to transfer to human")
    transfer_reason: str | None = Field(default=None, description="Reason for transfer")


class ConversationClearResponse(BaseModel):
    """Response for clearing a conversation."""

    success: bool
    message: str


# ============================================
# Endpoints
# ============================================


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Process a chat message and return AI response.

    This endpoint is for testing the conversation engine via text.
    In production, voice will come through Twilio/WebSocket.

    The conversation is stateful - use the returned conversation_id
    to continue the same conversation across multiple requests.
    """
    try:
        # Get or create conversation
        # Note: shop_config lookup would go here in production
        # For now, we use mock data
        service = get_or_create_conversation(
            conversation_id=request.conversation_id,
            shop_config=None,  # Uses MockAdapter
        )

        # Process the message
        result = await service.process_message(request.message)

        return ChatResponse(
            response=result.response,
            conversation_id=service.get_conversation_id(),
            intent=result.intent,
            tool_called=result.tool_called,
            should_transfer=result.should_transfer,
            transfer_reason=result.transfer_reason,
        )

    except Exception as e:
        logger.exception("Error processing chat message")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.delete("/conversation/{conversation_id}", response_model=ConversationClearResponse)
async def end_conversation(conversation_id: str) -> ConversationClearResponse:
    """End and clear a conversation.

    Call this when a call ends to free up memory.
    """
    clear_conversation(conversation_id)
    return ConversationClearResponse(
        success=True,
        message=f"Conversation {conversation_id} cleared",
    )


@router.get("/health")
async def voice_health() -> dict[str, Any]:
    """Health check for voice service."""
    return {
        "status": "healthy",
        "service": "voice",
    }


# ============================================
# WebSocket Endpoint for Realtime Voice
# ============================================


@router.websocket("/stream")
async def voice_stream(websocket: WebSocket, shop_id: str | None = None) -> None:
    """WebSocket endpoint for real-time voice conversations.

    This endpoint uses the OpenAI Realtime API for low-latency
    speech-to-speech conversations with function calling.

    Protocol:
    - Client sends: Raw PCM audio bytes (16kHz, 16-bit, mono) OR JSON messages
    - Server sends: Raw PCM audio bytes (24kHz, 16-bit, mono) OR JSON messages

    JSON message types:
    - Client: {"type": "text", "text": "..."} - Send text instead of audio
    - Client: {"type": "end"} - End the session
    - Server: {"type": "transcript", "role": "user"|"assistant", "text": "..."}
    - Server: {"type": "state", "state": "listening"|"speaking"|...}
    - Server: {"type": "error", "message": "..."}
    """
    await websocket.accept()
    logger.info("WebSocket connection accepted for shop_id=%s", shop_id)

    session: RealtimeSession | None = None

    try:
        # Get shop config if provided
        # TODO: Look up actual shop config from database
        shop_config = None  # Uses MockAdapter for now

        # Callbacks for session events
        async def on_audio_out(audio_chunk: bytes) -> None:
            """Send audio back to the client."""
            try:
                await websocket.send_bytes(audio_chunk)
            except Exception as e:
                logger.error("Failed to send audio: %s", e)

        async def on_transcript(role: str, text: str) -> None:
            """Send transcript to the client."""
            try:
                await websocket.send_json(
                    {
                        "type": "transcript",
                        "role": role,
                        "text": text,
                    }
                )
            except Exception as e:
                logger.error("Failed to send transcript: %s", e)

        async def on_state_change(state: SessionState) -> None:
            """Notify client of state changes."""
            try:
                await websocket.send_json(
                    {
                        "type": "state",
                        "state": state.value,
                    }
                )
            except Exception as e:
                logger.error("Failed to send state: %s", e)

        # Create and start session
        session = RealtimeSession(
            shop_config=shop_config,
            on_audio_out=on_audio_out,
            on_transcript=on_transcript,
            on_state_change=on_state_change,
        )
        register_session(session)

        await session.start()

        # Main message loop
        while True:
            try:
                message = await websocket.receive()

                if message.get("type") == "websocket.disconnect":
                    break

                # Handle binary audio data
                if "bytes" in message:
                    await session.send_audio(message["bytes"])

                # Handle JSON text messages
                elif "text" in message:
                    try:
                        data = json.loads(message["text"])
                        msg_type = data.get("type")

                        if msg_type == "end":
                            logger.info("Client requested session end")
                            break
                        elif msg_type == "text":
                            # Text input for testing without microphone
                            text = data.get("text", "")
                            if text:
                                await session.send_text(text)
                        else:
                            logger.warning("Unknown message type: %s", msg_type)

                    except json.JSONDecodeError:
                        logger.warning("Invalid JSON message: %s", message["text"][:100])

            except WebSocketDisconnect:
                logger.info("WebSocket disconnected")
                break

    except Exception as e:
        logger.exception("Error in voice stream: %s", e)
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": str(e),
                }
            )
        except Exception:
            pass

    finally:
        # Clean up session
        if session:
            unregister_session(session.session_id)
            await session.stop()
        logger.info("Voice stream session ended")
