"""SMS opt-out tracking model."""

from datetime import datetime

from beanie import Document, Indexed
from pydantic import Field

from app.common.utils import utc_now


class SmsOptOut(Document):
    """Tracks customers who have opted out of SMS notifications."""

    phone_number: Indexed(str) = Field(..., description="Customer phone number (E.164 format)")  # type: ignore[valid-type]
    shop_id: Indexed(str) = Field(..., description="Shop ID")  # type: ignore[valid-type]
    opted_out_at: datetime = Field(default_factory=utc_now, description="When the opt-out occurred")
    reason: str | None = Field(default=None, description="Optional reason for opt-out")

    class Settings:
        name = "sms_opt_outs"
        use_state_management = True

    def __str__(self) -> str:
        return f"SmsOptOut({self.phone_number}, shop={self.shop_id})"
