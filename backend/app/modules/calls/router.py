"""Call log endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.common.auth import AuthenticatedUser, get_current_user
from app.modules.calls import service
from app.modules.calls.models import CallLog
from app.modules.calls.schemas import CallLogCreate, CallLogResponse
from app.modules.shops import service as shop_service

router = APIRouter()


# ============================================
# Owner-scoped routes (authenticated)
# ============================================


@router.get("/me", response_model=list[CallLogResponse])
async def list_my_call_logs(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
) -> list[CallLog]:
    """List call logs for the current user's shop."""
    # Get user's shop
    shop = await shop_service.get_shop_config_by_owner(user.user_id)
    if not shop:
        # No shop means no calls
        return []

    return await service.get_call_logs(str(shop.id), limit)


@router.get("/me/{call_id}", response_model=CallLogResponse)
async def get_my_call_log(
    call_id: str,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> CallLog:
    """Get a specific call log by ID (must belong to user's shop)."""
    # Get user's shop
    shop = await shop_service.get_shop_config_by_owner(user.user_id)
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You don't have a shop configured",
        )

    call_log = await service.get_call_log_by_id(call_id)

    # Verify the call belongs to the user's shop
    if call_log.shop_id != str(shop.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This call log does not belong to your shop",
        )

    return call_log


# ============================================
# Internal routes (for voice system)
# ============================================


@router.post("", response_model=CallLogResponse, status_code=status.HTTP_201_CREATED)
async def create_call_log(call_data: CallLogCreate) -> CallLog:
    """Create a new call log.

    This is called internally by the voice system after each call.
    """
    return await service.create_call_log(call_data)
