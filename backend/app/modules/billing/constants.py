"""Billing plan constants and limits."""

from app.modules.billing.models import PlanTier

# Minute limits per billing period (monthly)
PLAN_MINUTE_LIMITS: dict[PlanTier, int | float] = {
    PlanTier.FREE: 60,
    PlanTier.STARTER: 500,
    PlanTier.PROFESSIONAL: 2500,
    PlanTier.ENTERPRISE: float("inf"),
}

# Keep PLAN_LIMITS as alias for backward compatibility during transition
PLAN_LIMITS = PLAN_MINUTE_LIMITS

# Plan display names
PLAN_NAMES: dict[PlanTier, str] = {
    PlanTier.FREE: "Free",
    PlanTier.STARTER: "Starter",
    PlanTier.PROFESSIONAL: "Professional",
    PlanTier.ENTERPRISE: "Enterprise",
}

# Plan prices (for display, actual billing through Stripe)
PLAN_PRICES: dict[PlanTier, int] = {
    PlanTier.FREE: 0,
    PlanTier.STARTER: 49,
    PlanTier.PROFESSIONAL: 99,
    PlanTier.ENTERPRISE: 0,  # Custom pricing
}

# Concurrent call limits per plan tier
CONCURRENT_CALL_LIMITS: dict[PlanTier, int | None] = {
    PlanTier.FREE: 2,
    PlanTier.STARTER: 5,
    PlanTier.PROFESSIONAL: 10,
    PlanTier.ENTERPRISE: None,  # Unlimited
}
