"""Request/response schemas for call logs."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.modules.calls.models import CallIntent, CallOutcome


class CallLogCreate(BaseModel):
    """Schema for creating a call log."""

    shop_id: str
    work_order_id: str | None = None
    call_sid: str | None = None
    caller_number: str | None = None
    duration_seconds: int | None = None
    intent: CallIntent = CallIntent.UNKNOWN
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    outcome: CallOutcome = CallOutcome.FAILED
    slots: dict[str, Any] = Field(default_factory=dict)
    tool_called: str | None = None
    tool_results: dict[str, Any] = Field(default_factory=dict)
    fallback_used: bool = False
    transfer_reason: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class CallLogResponse(BaseModel):
    """Schema for call log response."""

    id: str
    shop_id: str
    work_order_id: str | None
    call_sid: str | None
    caller_number: str | None
    timestamp: datetime
    duration_seconds: int | None
    intent: CallIntent
    confidence: float
    outcome: CallOutcome
    slots: dict[str, Any]
    tool_called: str | None
    tool_results: dict[str, Any]
    fallback_used: bool
    transfer_reason: str | None
    metadata: dict[str, Any]
