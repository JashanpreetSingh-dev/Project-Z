"""API router for customer context."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.common.auth import AuthenticatedUser, get_current_user
from app.modules.context.models import CustomerContext
from app.modules.context.service import get_customer_context
from app.modules.shops.service import get_shop_config_by_owner, normalize_phone

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/customer/{phone_number}")
async def get_customer_context_endpoint(
    phone_number: str,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> CustomerContext:
    """Get customer context by phone number.

    Args:
        phone_number: Customer phone number
        user: Authenticated user

    Returns:
        CustomerContext with interaction history

    Raises:
        HTTPException: If context not found or user doesn't have access
    """
    # Get user's shop
    shop_config = await get_shop_config_by_owner(user.user_id)
    if not shop_config:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Normalize phone number
    normalized = normalize_phone(phone_number)

    # Get context
    context = await get_customer_context(normalized, str(shop_config.id))
    if not context:
        raise HTTPException(
            status_code=404, detail="Customer context not found"
        )

    return context

