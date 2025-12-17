"""Customer context model for tracking cross-channel interactions."""

from datetime import datetime
from typing import Any

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.common.utils import utc_now


class InteractionRecord(BaseModel):
    """Record of a single customer interaction."""

    channel: str = Field(..., description="Channel: 'voice' or 'sms'")
    timestamp: datetime = Field(default_factory=utc_now)
    intent: str | None = Field(default=None, description="Intent for voice calls")
    summary: str | None = Field(default=None, description="Brief summary or message")
    outcome: str | None = Field(default=None, description="Outcome for voice calls")


class CustomerContext(Document):
    """Tracks customer interactions across all channels (voice, SMS, etc.)."""

    phone_number: Indexed(str) = Field(..., description="Customer phone number (E.164 format)")  # type: ignore[valid-type]
    shop_id: Indexed(str) = Field(..., description="Shop ID")  # type: ignore[valid-type]
    last_interaction: datetime = Field(default_factory=utc_now)
    interactions: list[InteractionRecord] = Field(
        default_factory=list, description="Cross-channel interaction history"
    )
    known_info: dict[str, Any] = Field(
        default_factory=dict,
        description="Accumulated customer knowledge (name, vehicles, work orders)",
    )

    class Settings:
        name = "customer_contexts"
        use_state_management = True

    def __str__(self) -> str:
        return f"CustomerContext({self.phone_number}, shop={self.shop_id})"
