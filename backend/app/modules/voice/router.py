"""Voice API endpoints for testing the conversation engine."""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

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
