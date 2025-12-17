"""Billing plan constants and limits."""

from app.modules.billing.models import PlanTier

# Call limits per billing period (monthly)
PLAN_LIMITS: dict[PlanTier, int | float] = {
    PlanTier.FREE: 10,
    PlanTier.STARTER: 100,
    PlanTier.PROFESSIONAL: 500,
    PlanTier.ENTERPRISE: float("inf"),
}

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

# Concurrent call limits per shop (based on plan tier)
CONCURRENT_CALL_LIMITS: dict[PlanTier, int] = {
    PlanTier.FREE: 1,
    PlanTier.STARTER: 3,
    PlanTier.PROFESSIONAL: 10,
    PlanTier.ENTERPRISE: 50,
}

# Global maximum concurrent calls across all shops (safety cap)
MAX_GLOBAL_CONCURRENT_CALLS: int = 100
