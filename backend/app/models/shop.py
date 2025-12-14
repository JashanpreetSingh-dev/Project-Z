"""Shop model for auto repair businesses."""

from datetime import UTC, datetime

from beanie import Document
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(UTC)


class BusinessHours(BaseModel):
    """Business hours for a single day."""

    open: str = Field(..., description="Opening time (HH:MM format)")
    close: str = Field(..., description="Closing time (HH:MM format)")
    closed: bool = Field(default=False, description="Whether the shop is closed this day")


class WeeklyHours(BaseModel):
    """Weekly business hours schedule."""

    monday: BusinessHours | None = None
    tuesday: BusinessHours | None = None
    wednesday: BusinessHours | None = None
    thursday: BusinessHours | None = None
    friday: BusinessHours | None = None
    saturday: BusinessHours | None = None
    sunday: BusinessHours | None = None


class ShopSettings(BaseModel):
    """AI and call handling settings for the shop."""

    ai_enabled: bool = True
    transfer_number: str | None = None
    allowed_intents: list[str] = Field(
        default_factory=lambda: ["CHECK_STATUS", "GET_HOURS", "GET_LOCATION", "GET_SERVICES", "TRANSFER_HUMAN"],
        description="Intents the AI is allowed to handle",
    )
    greeting_message: str = "Thank you for calling {shop_name}. How can I help you today?"


class Shop(Document):
    """Auto repair shop document."""

    name: str = Field(..., description="Shop name")
    phone: str = Field(..., description="Primary phone number")
    address: str = Field(..., description="Full address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")

    hours: WeeklyHours | None = None
    services: list[str] = Field(default_factory=list)
    settings: ShopSettings = Field(default_factory=ShopSettings)

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "shops"
        use_state_management = True

    def __str__(self) -> str:
        return f"Shop({self.name})"
