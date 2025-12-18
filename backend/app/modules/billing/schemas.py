"""Pydantic schemas for billing API requests/responses."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.modules.billing.models import PlanTier, SubscriptionStatus


class UsageResponse(BaseModel):
    """Current usage information."""

    call_count: int = Field(..., description="Calls used this period (for analytics)")
    call_limit: int | None = Field(
        default=None, description="Call limit (deprecated, use minute_limit)"
    )
    minutes_used: float = Field(..., ge=0.0, description="Minutes used this period")
    minute_limit: int | None = Field(..., description="Minute limit (None for unlimited)")
    period_start: datetime
    period_end: datetime
    percentage_used: float = Field(..., ge=0, le=100)


class SubscriptionResponse(BaseModel):
    """Full subscription information with usage."""

    plan_tier: PlanTier
    plan_name: str
    status: SubscriptionStatus
    price_monthly: int
    usage: UsageResponse
    stripe_customer_id: str | None = None
    current_period_start: datetime
    current_period_end: datetime


class CheckoutRequest(BaseModel):
    """Request to create a Stripe checkout session."""

    plan_tier: PlanTier = Field(..., description="Target plan to subscribe to")
    success_url: str = Field(..., description="URL to redirect after success")
    cancel_url: str = Field(..., description="URL to redirect after cancel")


class CheckoutResponse(BaseModel):
    """Stripe checkout session URL."""

    checkout_url: str


class PortalRequest(BaseModel):
    """Request to create a Stripe customer portal session."""

    return_url: str = Field(..., description="URL to return to after portal")


class PortalResponse(BaseModel):
    """Stripe customer portal URL."""

    portal_url: str


class QuotaStatus(BaseModel):
    """Quick quota check for call handling."""

    allowed: bool = Field(..., description="Whether calls are allowed")
    calls_remaining: int | None = Field(
        default=None, description="Calls remaining (deprecated, use minutes_remaining)"
    )
    minutes_remaining: int | None = Field(..., description="Minutes remaining (None for unlimited)")
    plan_tier: PlanTier
    upgrade_required: bool = Field(
        default=False,
        description="If True, limit exceeded - should transfer directly instead of AI handling",
    )
    concurrent_limit: int | None = Field(
        default=None, description="Max concurrent calls (None for unlimited)"
    )
    concurrent_count: int = Field(default=0, description="Current number of concurrent calls")
    concurrent_available: int | None = Field(
        default=None, description="Available concurrent slots (None for unlimited)"
    )
    queue_size: int = Field(default=0, description="Number of calls waiting in queue")
