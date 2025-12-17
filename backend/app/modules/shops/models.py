"""Shop configuration model for multi-tenant adapter routing."""

from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.common.utils import utc_now


class AdapterType(str, Enum):
    """Supported shop management system adapters."""

    MOCK = "mock"  # For MVP testing with sample JSON
    TEKMETRIC = "tekmetric"  # Tekmetric integration
    SHOPWARE = "shopware"  # Shop-Ware integration


class ShopSettings(BaseModel):
    """AI and call handling settings for the shop."""

    ai_enabled: bool = True
    transfer_number: str | None = None
    allowed_intents: list[str] = Field(
        default_factory=lambda: [
            "CHECK_STATUS",
            "GET_HOURS",
            "GET_LOCATION",
            "GET_SERVICES",
            "TRANSFER_HUMAN",
        ],
        description="Intents the AI is allowed to handle",
    )
    greeting_message: str = "Thank you for calling {shop_name}. How can I help you today?"
    max_call_duration_seconds: int = Field(
        default=300, description="Max call duration before auto-transfer"
    )
    sms_call_summary_enabled: bool = Field(
        default=False, description="Enable SMS call summaries (opt-in)"
    )
    sms_from_number: str | None = Field(
        default=None, description="SMS sender number override (defaults to shop's Twilio number)"
    )


class AdapterCredentials(BaseModel):
    """Credentials for connecting to external shop management systems."""

    api_key: str | None = None
    api_secret: str | None = None
    shop_id: str | None = Field(default=None, description="Shop ID in the external system")
    webhook_url: str | None = Field(default=None, description="Webhook URL for real-time updates")


class ShopConfig(Document):
    """Shop configuration - which adapter to use and how to connect.

    Note: Currently 1 user = 1 shop (MVP). Future expansion planned for:
    - Multiple shops per user
    - Role-based access control (RBAC)
    - Team members with different permission levels
    """

    # Ownership (Clerk user ID)
    owner_id: Indexed(str) = Field(..., description="Clerk user ID who owns this shop")  # type: ignore[valid-type]

    # Identification
    name: str = Field(..., description="Shop display name")
    phone: Indexed(str) = Field(..., description="Primary phone number (used to route calls)")  # type: ignore[valid-type]

    # Adapter configuration
    adapter_type: AdapterType = Field(
        default=AdapterType.MOCK, description="Which data source to use"
    )
    adapter_credentials: AdapterCredentials = Field(default_factory=AdapterCredentials)

    # AI settings
    settings: ShopSettings = Field(default_factory=ShopSettings)

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "shop_configs"
        use_state_management = True

    def __str__(self) -> str:
        return f"ShopConfig({self.name}, adapter={self.adapter_type})"
