"""Shop management endpoints."""

from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models.shop import Shop, WeeklyHours, ShopSettings

router = APIRouter()


# ============================================
# Request/Response Schemas
# ============================================


class ShopCreate(BaseModel):
    """Schema for creating a new shop."""

    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=10)
    address: str
    city: str
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str

    hours: Optional[WeeklyHours] = None
    services: list[str] = []
    settings: Optional[ShopSettings] = None


class ShopUpdate(BaseModel):
    """Schema for updating a shop."""

    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    hours: Optional[WeeklyHours] = None
    services: Optional[list[str]] = None
    settings: Optional[ShopSettings] = None


class ShopResponse(BaseModel):
    """Schema for shop response."""

    id: str
    name: str
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    hours: Optional[WeeklyHours]
    services: list[str]
    settings: ShopSettings
    created_at: datetime
    updated_at: datetime


# ============================================
# Endpoints
# ============================================


@router.get("", response_model=list[ShopResponse])
async def list_shops() -> list[Shop]:
    """List all shops."""
    return await Shop.find_all().to_list()


@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def create_shop(shop_data: ShopCreate) -> Shop:
    """Create a new shop."""
    shop = Shop(
        **shop_data.model_dump(exclude_unset=True),
        settings=shop_data.settings or ShopSettings(),
    )
    await shop.insert()
    return shop


@router.get("/{shop_id}", response_model=ShopResponse)
async def get_shop(shop_id: str) -> Shop:
    """Get a specific shop by ID."""
    shop = await Shop.get(PydanticObjectId(shop_id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop with id {shop_id} not found",
        )
    return shop


@router.patch("/{shop_id}", response_model=ShopResponse)
async def update_shop(shop_id: str, shop_data: ShopUpdate) -> Shop:
    """Update a shop."""
    shop = await Shop.get(PydanticObjectId(shop_id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop with id {shop_id} not found",
        )

    update_data = shop_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    await shop.update({"$set": update_data})
    await shop.sync()

    return shop


@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop(shop_id: str) -> None:
    """Delete a shop."""
    shop = await Shop.get(PydanticObjectId(shop_id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop with id {shop_id} not found",
        )

    await shop.delete()
