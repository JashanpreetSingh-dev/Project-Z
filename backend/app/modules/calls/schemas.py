"""Request/response schemas for call logs."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

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

    model_config = ConfigDict(from_attributes=True)

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

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v: Any) -> str:
        """Convert MongoDB ObjectId to string."""
        return str(v)


class DailyCallCount(BaseModel):
    """Daily call count for analytics charts."""

    date: str  # ISO date string (YYYY-MM-DD)
    count: int


class CallAnalytics(BaseModel):
    """Aggregated call analytics for a shop."""

    period_start: datetime
    period_end: datetime
    total_calls: int
    avg_duration_seconds: float | None

    # Volume over time (for charts)
    calls_by_day: list[DailyCallCount]

    # Outcome breakdown
    outcomes: dict[str, int]
    resolution_rate: float  # Percentage of calls resolved by AI (0-100)

    # Intent breakdown
    intents: dict[str, int]

    # Peak hours (hour 0-23 -> count)
    calls_by_hour: dict[str, int]
