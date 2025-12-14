"""Request/response schemas for shops."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.modules.shops.models import ShopSettings, WeeklyHours


class ShopCreate(BaseModel):
    """Schema for creating a new shop."""

    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=10)
    address: str
    city: str
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str

    hours: WeeklyHours | None = None
    services: list[str] = Field(default_factory=list)
    settings: ShopSettings | None = None


class ShopUpdate(BaseModel):
    """Schema for updating a shop."""

    name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None

    hours: WeeklyHours | None = None
    services: list[str] | None = None
    settings: ShopSettings | None = None


class ShopResponse(BaseModel):
    """Schema for shop response."""

    id: str
    name: str
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    hours: WeeklyHours | None
    services: list[str]
    settings: ShopSettings
    created_at: datetime
    updated_at: datetime
