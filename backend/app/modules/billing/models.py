"""Billing models for subscriptions and usage tracking."""

from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field

from app.common.utils import utc_now


class PlanTier(str, Enum):
    """Available subscription tiers."""

    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, Enum):
    """Subscription status."""

    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"


class Subscription(Document):
    """Subscription document for tracking shop billing status.

    Each shop has one subscription. Free tier shops have a subscription
    with plan_tier=FREE and no stripe_subscription_id.
    """

    # Shop reference (1:1 with ShopConfig)
    shop_id: Indexed(str) = Field(..., description="Reference to ShopConfig")  # type: ignore[valid-type]

    # Stripe references
    stripe_customer_id: str | None = Field(default=None, description="Stripe customer ID")
    stripe_subscription_id: str | None = Field(
        default=None, description="Stripe subscription ID (None for free tier)"
    )

    # Plan details
    plan_tier: PlanTier = Field(default=PlanTier.FREE, description="Current plan tier")
    status: SubscriptionStatus = Field(
        default=SubscriptionStatus.ACTIVE, description="Subscription status"
    )

    # Billing period (for usage tracking)
    current_period_start: datetime = Field(
        default_factory=utc_now, description="Start of current billing period"
    )
    current_period_end: datetime = Field(
        default_factory=utc_now, description="End of current billing period"
    )

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "subscriptions"
        use_state_management = True

    def __str__(self) -> str:
        return f"Subscription({self.shop_id}, {self.plan_tier}, {self.status})"


class UsageRecord(Document):
    """Usage tracking per billing period.

    A new record is created for each billing period. The call_count
    is incremented each time a call is completed.
    """

    # Shop reference
    shop_id: Indexed(str) = Field(..., description="Reference to ShopConfig")  # type: ignore[valid-type]

    # Billing period this usage belongs to
    period_start: datetime = Field(..., description="Start of billing period")
    period_end: datetime = Field(..., description="End of billing period")

    # Usage metrics
    call_count: int = Field(default=0, ge=0, description="Number of calls this period")
    last_call_at: datetime | None = Field(default=None, description="Timestamp of last call")

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "usage_records"
        use_state_management = True
        indexes = [
            [("shop_id", 1), ("period_start", -1)],  # For querying current period
        ]

    def __str__(self) -> str:
        return f"UsageRecord({self.shop_id}, calls={self.call_count})"
