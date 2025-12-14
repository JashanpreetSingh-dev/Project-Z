"""Shop configuration endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.common.auth import AuthenticatedUser, get_current_user
from app.modules.shops import service
from app.modules.shops.models import ShopConfig
from app.modules.shops.schemas import (
    ShopConfigCreate,
    ShopConfigResponse,
    ShopConfigUpdate,
)

router = APIRouter()


# ============================================
# Owner-scoped routes (authenticated)
# ============================================


@router.get("/me", response_model=ShopConfigResponse | None)
async def get_my_shop(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ShopConfig | None:
    """Get the current user's shop configuration.

    Returns None if the user hasn't created a shop yet.
    """
    return await service.get_shop_config_by_owner(user.user_id)


@router.post("/me", response_model=ShopConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_my_shop(
    data: ShopConfigCreate,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ShopConfig:
    """Create a shop for the current user.

    Each user can only have one shop (MVP limitation).
    """
    # Check if user already has a shop
    existing = await service.get_shop_config_by_owner(user.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a shop. Use PATCH /api/shops/me to update it.",
        )

    return await service.create_shop_config(data, owner_id=user.user_id)


@router.patch("/me", response_model=ShopConfigResponse)
async def update_my_shop(
    data: ShopConfigUpdate,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ShopConfig:
    """Update the current user's shop configuration."""
    return await service.update_shop_config_by_owner(user.user_id, data)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_shop(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> None:
    """Delete the current user's shop configuration."""
    await service.delete_shop_config_by_owner(user.user_id)


# ============================================
# Public routes (for voice/telephony system)
# ============================================


@router.get("/by-phone/{phone}", response_model=ShopConfigResponse)
async def get_shop_by_phone(phone: str) -> ShopConfig:
    """Get a shop configuration by phone number.

    This is used by the telephony system to route incoming calls.
    """
    config = await service.get_shop_config_by_phone(phone)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No shop found for phone number: {phone}",
        )
    return config
