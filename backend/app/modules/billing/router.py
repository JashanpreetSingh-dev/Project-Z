"""Billing API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.common.auth import AuthenticatedUser, get_current_user
from app.modules.billing import service
from app.modules.billing.models import PlanTier
from app.modules.billing.schemas import (
    CheckoutRequest,
    CheckoutResponse,
    PortalRequest,
    PortalResponse,
    QuotaStatus,
    SubscriptionResponse,
)
from app.modules.shops.service import get_shop_config_by_owner

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_shop_id(user: AuthenticatedUser) -> str:
    """Get shop ID for authenticated user, raise if not found."""
    shop = await get_shop_config_by_owner(user.user_id)
    if not shop or not shop.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No shop found. Please create a shop first.",
        )
    return str(shop.id)


# =============================================================================
# Subscription Endpoints
# =============================================================================


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> SubscriptionResponse:
    """Get current subscription and usage information."""
    shop_id = await _get_shop_id(user)
    return await service.get_subscription_response(shop_id)


@router.get("/quota", response_model=QuotaStatus)
async def check_quota(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> QuotaStatus:
    """Check if shop has remaining call quota."""
    shop_id = await _get_shop_id(user)
    return await service.check_quota(shop_id)


# =============================================================================
# Stripe Checkout
# =============================================================================


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    data: CheckoutRequest,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> CheckoutResponse:
    """Create a Stripe checkout session to upgrade subscription.

    Returns a URL to redirect the user to Stripe's checkout page.
    """
    shop_id = await _get_shop_id(user)

    # Validate plan tier
    if data.plan_tier == PlanTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot checkout for free tier. Use cancel instead.",
        )

    if data.plan_tier == PlanTier.ENTERPRISE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enterprise requires custom pricing. Contact sales.",
        )

    try:
        checkout_url = await service.create_checkout_session(
            shop_id=shop_id,
            plan_tier=data.plan_tier,
            success_url=data.success_url,
            cancel_url=data.cancel_url,
        )
        return CheckoutResponse(checkout_url=checkout_url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        logger.exception("Checkout creation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session",
        ) from e


# =============================================================================
# Stripe Customer Portal
# =============================================================================


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    data: PortalRequest,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> PortalResponse:
    """Create a Stripe customer portal session.

    Returns a URL to redirect the user to manage their subscription,
    payment methods, and view invoices.
    """
    shop_id = await _get_shop_id(user)

    try:
        portal_url = await service.create_portal_session(
            shop_id=shop_id,
            return_url=data.return_url,
        )
        return PortalResponse(portal_url=portal_url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        logger.exception("Portal creation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portal session",
        ) from e


# =============================================================================
# Stripe Webhooks
# =============================================================================


@router.post("/webhook")
async def stripe_webhook(request: Request) -> dict:
    """Handle Stripe webhook events.

    This endpoint receives events from Stripe about subscription changes,
    payment failures, etc. It must be configured in Stripe dashboard.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature",
        )

    try:
        result = await service.handle_webhook_event(payload, signature)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        logger.exception("Webhook processing failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed",
        ) from e
