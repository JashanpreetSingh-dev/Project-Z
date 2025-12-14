"""Shop configuration endpoints."""

from fastapi import APIRouter, status

from app.modules.shops import service
from app.modules.shops.models import ShopConfig
from app.modules.shops.schemas import (
    ShopConfigCreate,
    ShopConfigResponse,
    ShopConfigUpdate,
)

router = APIRouter()


@router.get("", response_model=list[ShopConfigResponse])
async def list_shop_configs() -> list[ShopConfig]:
    """List all shop configurations."""
    return await service.get_all_shop_configs()


@router.post("", response_model=ShopConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_shop_config(data: ShopConfigCreate) -> ShopConfig:
    """Create a new shop configuration."""
    return await service.create_shop_config(data)


@router.get("/{shop_id}", response_model=ShopConfigResponse)
async def get_shop_config(shop_id: str) -> ShopConfig:
    """Get a specific shop configuration by ID."""
    return await service.get_shop_config_by_id(shop_id)


@router.patch("/{shop_id}", response_model=ShopConfigResponse)
async def update_shop_config(shop_id: str, data: ShopConfigUpdate) -> ShopConfig:
    """Update a shop configuration."""
    return await service.update_shop_config(shop_id, data)


@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop_config(shop_id: str) -> None:
    """Delete a shop configuration."""
    await service.delete_shop_config(shop_id)
