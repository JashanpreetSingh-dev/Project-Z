"""Billing service for subscription management and Stripe integration."""

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import stripe

from app.common.utils import utc_now
from app.config import get_settings
from app.modules.billing.constants import PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES
from app.modules.billing.models import (
    PlanTier,
    Subscription,
    SubscriptionStatus,
    UsageRecord,
)
from app.modules.billing.schemas import (
    QuotaStatus,
    SubscriptionResponse,
    UsageResponse,
)

logger = logging.getLogger(__name__)


def _ensure_tz_aware(dt: datetime) -> datetime:
    """Ensure a datetime is timezone-aware (UTC).

    MongoDB returns timezone-naive datetimes, but we use timezone-aware
    datetimes internally. This function adds UTC timezone if missing.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


_settings = get_settings()

# Configure Stripe
stripe.api_key = _settings.stripe_secret_key


# =============================================================================
# Stripe Price ID Mapping
# =============================================================================


def get_stripe_price_id(plan_tier: PlanTier) -> str | None:
    """Get Stripe price ID for a plan tier."""
    mapping = {
        PlanTier.STARTER: _settings.stripe_starter_price_id,
        PlanTier.PROFESSIONAL: _settings.stripe_pro_price_id,
    }
    return mapping.get(plan_tier)


def get_plan_tier_from_price_id(price_id: str) -> PlanTier:
    """Get plan tier from Stripe price ID."""
    if price_id == _settings.stripe_starter_price_id:
        return PlanTier.STARTER
    elif price_id == _settings.stripe_pro_price_id:
        return PlanTier.PROFESSIONAL
    return PlanTier.FREE


# =============================================================================
# Subscription Management
# =============================================================================


async def get_or_create_subscription(shop_id: str) -> Subscription:
    """Get existing subscription or create a free tier subscription.

    Args:
        shop_id: The shop's ID.

    Returns:
        The shop's subscription.
    """
    subscription = await Subscription.find_one(Subscription.shop_id == shop_id)

    if not subscription:
        # Create free tier subscription with 30-day period
        now = utc_now()
        subscription = Subscription(
            shop_id=shop_id,
            plan_tier=PlanTier.FREE,
            status=SubscriptionStatus.ACTIVE,
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        await subscription.insert()
        logger.info("Created free subscription for shop %s", shop_id)
    else:
        # Ensure period fields exist (for backward compatibility with old documents)
        # Use getattr with sentinel to check if field is actually set
        _MISSING = object()
        now = utc_now()
        needs_save = False
        if getattr(subscription, "current_period_start", _MISSING) is _MISSING:
            subscription.current_period_start = now
            needs_save = True
        if getattr(subscription, "current_period_end", _MISSING) is _MISSING:
            subscription.current_period_end = now + timedelta(days=30)
            needs_save = True
        if needs_save:
            await subscription.save()

    return subscription


async def get_subscription_response(shop_id: str) -> SubscriptionResponse:
    """Get full subscription info with usage for API response.

    Args:
        shop_id: The shop's ID.

    Returns:
        Complete subscription info with usage.
    """
    subscription = await get_or_create_subscription(shop_id)
    usage = await get_current_usage(shop_id)

    limit = PLAN_LIMITS[subscription.plan_tier]
    call_limit = None if limit == float("inf") else int(limit)

    if call_limit:
        percentage = min((usage.call_count / call_limit) * 100, 100)
    else:
        percentage = 0

    return SubscriptionResponse(
        plan_tier=subscription.plan_tier,
        plan_name=PLAN_NAMES[subscription.plan_tier],
        status=subscription.status,
        price_monthly=PLAN_PRICES[subscription.plan_tier],
        usage=UsageResponse(
            call_count=usage.call_count,
            call_limit=call_limit,
            period_start=usage.period_start,
            period_end=usage.period_end,
            percentage_used=percentage,
        ),
        stripe_customer_id=subscription.stripe_customer_id,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
    )


# =============================================================================
# Usage Tracking
# =============================================================================


async def get_current_usage(shop_id: str) -> UsageRecord:
    """Get or create usage record for current billing period.

    Args:
        shop_id: The shop's ID.

    Returns:
        Current period usage record.
    """
    subscription = await get_or_create_subscription(shop_id)
    now = utc_now()

    # Check if we need to roll over to a new period
    period_end = _ensure_tz_aware(subscription.current_period_end)
    if now >= period_end:
        # Update subscription period
        subscription.current_period_start = now
        subscription.current_period_end = now + timedelta(days=30)
        subscription.updated_at = now
        await subscription.save()

    # Find usage record for current period
    usage = await UsageRecord.find_one(
        UsageRecord.shop_id == shop_id,
        UsageRecord.period_start == subscription.current_period_start,
    )

    if not usage:
        usage = UsageRecord(
            shop_id=shop_id,
            period_start=subscription.current_period_start,
            period_end=subscription.current_period_end,
            call_count=0,
        )
        await usage.insert()
        logger.info("Created usage record for shop %s", shop_id)

    return usage


async def increment_usage(shop_id: str) -> UsageRecord:
    """Increment call count for current period.

    Args:
        shop_id: The shop's ID.

    Returns:
        Updated usage record.
    """
    usage = await get_current_usage(shop_id)
    usage.call_count += 1
    usage.last_call_at = utc_now()
    usage.updated_at = utc_now()
    await usage.save()
    logger.debug("Usage incremented for shop %s: %d calls", shop_id, usage.call_count)
    return usage


# =============================================================================
# Quota Checking
# =============================================================================


async def check_quota(shop_id: str) -> QuotaStatus:
    """Check if shop has remaining quota for calls.

    Args:
        shop_id: The shop's ID.

    Returns:
        Quota status indicating if calls are allowed.
    """
    subscription = await get_or_create_subscription(shop_id)
    usage = await get_current_usage(shop_id)

    limit = PLAN_LIMITS[subscription.plan_tier]

    # Unlimited plan
    if limit == float("inf"):
        return QuotaStatus(
            allowed=True,
            calls_remaining=None,
            plan_tier=subscription.plan_tier,
            upgrade_required=False,
        )

    calls_remaining = int(limit) - usage.call_count
    allowed = calls_remaining > 0

    return QuotaStatus(
        allowed=allowed,
        calls_remaining=max(0, calls_remaining),
        plan_tier=subscription.plan_tier,
        upgrade_required=not allowed,
    )


# =============================================================================
# Stripe Checkout
# =============================================================================


async def create_checkout_session(
    shop_id: str,
    plan_tier: PlanTier,
    success_url: str,
    cancel_url: str,
) -> str:
    """Create a Stripe checkout session for subscription.

    Args:
        shop_id: The shop's ID.
        plan_tier: Target plan to subscribe to.
        success_url: URL to redirect after successful checkout.
        cancel_url: URL to redirect if checkout is canceled.

    Returns:
        Checkout session URL.

    Raises:
        ValueError: If plan tier doesn't have a Stripe price.
    """
    price_id = get_stripe_price_id(plan_tier)
    if not price_id:
        raise ValueError(f"No Stripe price configured for {plan_tier}")

    subscription = await get_or_create_subscription(shop_id)

    # Get or create Stripe customer
    if subscription.stripe_customer_id:
        customer_id = subscription.stripe_customer_id
    else:
        customer = stripe.Customer.create(
            metadata={"shop_id": shop_id},
        )
        customer_id = customer.id
        subscription.stripe_customer_id = customer_id
        subscription.updated_at = utc_now()
        await subscription.save()

    # Create checkout session
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"shop_id": shop_id},
    )

    logger.info("Created checkout session for shop %s, plan %s", shop_id, plan_tier)
    if not session.url:
        raise ValueError("Stripe checkout session created without URL")
    return session.url


async def create_portal_session(shop_id: str, return_url: str) -> str:
    """Create a Stripe customer portal session.

    Args:
        shop_id: The shop's ID.
        return_url: URL to return to after portal.

    Returns:
        Portal session URL.

    Raises:
        ValueError: If shop doesn't have a Stripe customer.
    """
    subscription = await get_or_create_subscription(shop_id)

    if not subscription.stripe_customer_id:
        raise ValueError("No Stripe customer found for this shop")

    session = stripe.billing_portal.Session.create(
        customer=subscription.stripe_customer_id,
        return_url=return_url,
    )

    logger.info("Created portal session for shop %s", shop_id)
    return session.url


# =============================================================================
# Stripe Webhook Handling
# =============================================================================


async def handle_webhook_event(payload: bytes, signature: str) -> dict[str, Any]:
    """Process Stripe webhook event.

    Args:
        payload: Raw request body.
        signature: Stripe signature header.

    Returns:
        Processing result.

    Raises:
        ValueError: If signature is invalid.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            _settings.stripe_webhook_secret,
        )
    except stripe.SignatureVerificationError as e:
        logger.error("Invalid Stripe signature: %s", e)
        raise ValueError("Invalid signature") from e

    event_type = event["type"]
    data = event["data"]["object"]

    logger.info("Processing Stripe webhook: %s", event_type)

    if event_type == "checkout.session.completed":
        await _handle_checkout_completed(data)
    elif event_type == "customer.subscription.updated":
        await _handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_deleted(data)
    elif event_type == "invoice.payment_failed":
        await _handle_payment_failed(data)
    else:
        logger.debug("Unhandled event type: %s", event_type)

    return {"status": "processed", "type": event_type}


async def _handle_checkout_completed(data: dict[str, Any]) -> None:
    """Handle successful checkout - activate subscription."""
    shop_id = data.get("metadata", {}).get("shop_id")
    subscription_id = data.get("subscription")
    customer_id = data.get("customer")

    if not shop_id:
        logger.warning("Checkout completed without shop_id metadata")
        return

    subscription = await get_or_create_subscription(shop_id)

    # Get subscription details from Stripe
    if subscription_id:
        stripe_sub = stripe.Subscription.retrieve(subscription_id)
        price_id = stripe_sub.items.data[0].price.id
        plan_tier = get_plan_tier_from_price_id(price_id)

        subscription.stripe_subscription_id = subscription_id
        subscription.stripe_customer_id = customer_id
        subscription.plan_tier = plan_tier
        subscription.status = SubscriptionStatus.ACTIVE
        # Ensure fields exist by accessing them first (triggers default_factory if needed)
        try:
            _ = subscription.current_period_start
        except AttributeError:
            subscription.current_period_start = utc_now()
        try:
            _ = subscription.current_period_end
        except AttributeError:
            subscription.current_period_end = utc_now() + timedelta(days=30)
        # Now set the actual values using setattr to satisfy type checker
        setattr(
            subscription,
            "current_period_start",
            datetime.fromtimestamp(stripe_sub.current_period_start),  # type: ignore[attr-defined]
        )
        setattr(
            subscription,
            "current_period_end",
            datetime.fromtimestamp(stripe_sub.current_period_end),  # type: ignore[attr-defined]
        )
        subscription.updated_at = utc_now()
        await subscription.save()

        logger.info("Activated %s subscription for shop %s", plan_tier, shop_id)


async def _handle_subscription_updated(data: dict[str, Any]) -> None:
    """Handle subscription changes (upgrades, downgrades)."""
    subscription_id = data.get("id")
    customer_id = data.get("customer")

    # Find subscription by Stripe subscription ID
    subscription = await Subscription.find_one(
        Subscription.stripe_subscription_id == subscription_id
    )

    if not subscription:
        # Try by customer ID
        subscription = await Subscription.find_one(Subscription.stripe_customer_id == customer_id)

    if not subscription:
        logger.warning("Subscription updated but not found: %s", subscription_id)
        return

    # Ensure period fields exist (for backward compatibility)
    try:
        _ = subscription.current_period_start
    except AttributeError:
        subscription.current_period_start = utc_now()
    try:
        _ = subscription.current_period_end
    except AttributeError:
        subscription.current_period_end = utc_now() + timedelta(days=30)

    # Update plan tier
    items = data.get("items", {}).get("data", [])
    if items:
        price_id = items[0].get("price", {}).get("id", "")
        subscription.plan_tier = get_plan_tier_from_price_id(price_id)

    if data.get("current_period_start"):
        subscription.current_period_start = datetime.fromtimestamp(data["current_period_start"])
    if data.get("current_period_end"):
        subscription.current_period_end = datetime.fromtimestamp(data["current_period_end"])

    # Update status
    status_map = {
        "active": SubscriptionStatus.ACTIVE,
        "past_due": SubscriptionStatus.PAST_DUE,
        "canceled": SubscriptionStatus.CANCELED,
        "trialing": SubscriptionStatus.TRIALING,
    }
    subscription.status = status_map.get(data["status"], SubscriptionStatus.ACTIVE)
    subscription.updated_at = utc_now()
    await subscription.save()

    logger.info(
        "Updated subscription %s: %s, %s",
        subscription_id,
        subscription.plan_tier,
        subscription.status,
    )


async def _handle_subscription_deleted(data: dict[str, Any]) -> None:
    """Handle subscription cancellation - revert to free tier."""
    subscription_id = data.get("id")

    subscription = await Subscription.find_one(
        Subscription.stripe_subscription_id == subscription_id
    )

    if not subscription:
        logger.warning("Subscription deleted but not found: %s", subscription_id)
        return

    # Ensure period fields exist (for backward compatibility)
    try:
        _ = subscription.current_period_start
    except AttributeError:
        subscription.current_period_start = utc_now()
    try:
        _ = subscription.current_period_end
    except AttributeError:
        subscription.current_period_end = utc_now() + timedelta(days=30)

    # Revert to free tier
    now = utc_now()
    subscription.plan_tier = PlanTier.FREE
    subscription.status = SubscriptionStatus.CANCELED
    subscription.stripe_subscription_id = None
    subscription.current_period_start = now
    subscription.current_period_end = now + timedelta(days=30)
    subscription.updated_at = now
    await subscription.save()

    logger.info("Subscription %s canceled, reverted to free tier", subscription_id)


async def _handle_payment_failed(data: dict[str, Any]) -> None:
    """Handle failed payment - mark as past due."""
    subscription_id = data.get("subscription")

    if not subscription_id:
        return

    subscription = await Subscription.find_one(
        Subscription.stripe_subscription_id == subscription_id
    )

    if subscription:
        subscription.status = SubscriptionStatus.PAST_DUE
        subscription.updated_at = utc_now()
        await subscription.save()
        logger.warning("Payment failed for subscription %s", subscription_id)
