"""Shop management endpoints."""

from fastapi import APIRouter, status

from app.modules.shops import service
from app.modules.shops.models import Shop
from app.modules.shops.schemas import ShopCreate, ShopResponse, ShopUpdate

router = APIRouter()


@router.get("", response_model=list[ShopResponse])
async def list_shops() -> list[Shop]:
    """List all shops."""
    return await service.get_all_shops()


@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def create_shop(shop_data: ShopCreate) -> Shop:
    """Create a new shop."""
    return await service.create_shop(shop_data)


@router.get("/{shop_id}", response_model=ShopResponse)
async def get_shop(shop_id: str) -> Shop:
    """Get a specific shop by ID."""
    return await service.get_shop_by_id(shop_id)


@router.patch("/{shop_id}", response_model=ShopResponse)
async def update_shop(shop_id: str, shop_data: ShopUpdate) -> Shop:
    """Update a shop."""
    return await service.update_shop(shop_id, shop_data)


@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop(shop_id: str) -> None:
    """Delete a shop."""
    await service.delete_shop(shop_id)
