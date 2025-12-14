"""Request/response schemas for shop configuration."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.shops.models import AdapterCredentials, AdapterType, ShopSettings


class ShopConfigCreate(BaseModel):
    """Schema for creating a new shop configuration."""

    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=10, description="Primary phone number for call routing")

    adapter_type: AdapterType = AdapterType.MOCK
    adapter_credentials: AdapterCredentials | None = None

    settings: ShopSettings | None = None


class ShopConfigUpdate(BaseModel):
    """Schema for updating a shop configuration."""

    name: str | None = None
    phone: str | None = None

    adapter_type: AdapterType | None = None
    adapter_credentials: AdapterCredentials | None = None

    settings: ShopSettings | None = None


class ShopConfigResponse(BaseModel):
    """Schema for shop configuration response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    name: str
    phone: str

    adapter_type: AdapterType
    # Note: credentials are NOT returned in responses for security

    settings: ShopSettings
    created_at: datetime
    updated_at: datetime

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v: Any) -> str:
        """Convert MongoDB ObjectId to string."""
        return str(v)
