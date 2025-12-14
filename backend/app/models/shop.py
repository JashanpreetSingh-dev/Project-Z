"""Shop model for auto repair businesses."""

from datetime import datetime

from beanie import Document
from pydantic import BaseModel, Field


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

    ai_enabled: bool = Field(default=True, description="Whether AI receptionist is active")
    transfer_number: str | None = Field(None, description="Number to transfer calls to")
    allowed_intents: list[str] = Field(
        default=["CHECK_STATUS", "GET_HOURS", "GET_LOCATION", "GET_SERVICES", "TRANSFER_HUMAN"],
        description="Intents the AI is allowed to handle",
    )
    greeting_message: str = Field(
        default="Thank you for calling {shop_name}. How can I help you today?",
        description="Custom greeting message",
    )


class Shop(Document):
    """Auto repair shop document."""

    name: str = Field(..., description="Shop name")
    phone: str = Field(..., description="Primary phone number")
    address: str = Field(..., description="Full address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")

    hours: WeeklyHours | None = Field(default=None, description="Business hours")
    services: list[str] = Field(default=[], description="Services offered")
    settings: ShopSettings = Field(default_factory=ShopSettings)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "shops"
        use_state_management = True

    def __str__(self) -> str:
        return f"Shop({self.name})"
