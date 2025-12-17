"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  ArrowRight,
  Zap,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  type PlanTier,
} from "@/lib/api";
import { useSubscription } from "@/hooks/billing/use-subscription";
import { useCheckout } from "@/hooks/billing/use-checkout";
import { usePortal } from "@/hooks/billing/use-portal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Plan details for display
const PLANS: {
  tier: PlanTier;
  name: string;
  price: number;
  calls: number | null;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    calls: 10,
    features: [
      "10 calls/month",
      "AI phone receptionist",
      "Basic call summaries",
    ],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 49,
    calls: 100,
    features: [
      "100 calls/month",
      "AI phone receptionist",
      "Repair status lookups",
      "Business hours & location",
      "Call summaries",
    ],
  },
  {
    tier: "professional",
    name: "Professional",
    price: 99,
    calls: 500,
    highlighted: true,
    features: [
      "500 calls/month",
      "Everything in Starter",
      "Smart call transfers",
      "Custom greetings",
      "Analytics dashboard",
      "Priority support",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 0,
    calls: null,
    features: [
      "Unlimited calls",
      "Everything in Professional",
      "Shop integrations",
      "Dedicated manager",
      "Custom AI training",
      "SLA guarantee",
    ],
  },
];

export default function BillingPage() {
  const { data: subscription, isLoading, error } = useSubscription();
  const checkout = useCheckout();
  const portal = usePortal();

  const handleUpgrade = async (planTier: PlanTier) => {
    if (planTier === "enterprise") {
      window.location.href = "/contact";
      return;
    }

    try {
      const successUrl = `${window.location.origin}/dashboard/billing?success=true`;
      const cancelUrl = `${window.location.origin}/dashboard/billing?canceled=true`;

      const { checkout_url } = await checkout.mutateAsync({
        planTier,
        successUrl,
        cancelUrl,
      });

      window.location.href = checkout_url;
    } catch (err) {
      // Error is handled by React Query
    }
  };

  const handleManageSubscription = async () => {
    try {
      const returnUrl = `${window.location.origin}/dashboard/billing`;
      const { portal_url } = await portal.mutateAsync(returnUrl);

      window.location.href = portal_url;
    } catch (err) {
      // Error is handled by React Query
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading billing information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Error loading billing</p>
        </div>
        <p className="mt-1 text-sm opacity-80">{error instanceof Error ? error.message : "Failed to load billing"}</p>
      </div>
    );
  }

  if (!subscription) return null;

  const usagePercentage = subscription.usage.percentage_used;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Plan
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{subscription.plan_name}</span>
              <Badge
                variant={subscription.status === "active" ? "default" : "secondary"}
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {subscription.price_monthly > 0
                ? `$${subscription.price_monthly}/month`
                : "Free forever"}
            </p>
            {subscription.stripe_customer_id && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={handleManageSubscription}
                disabled={portal.isPending}
              >
                {portal.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usage This Period
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {subscription.usage.call_count}
              </span>
              <span className="text-muted-foreground">
                / {subscription.usage.call_limit ?? "∞"} calls
              </span>
            </div>

            {/* Progress bar */}
            {subscription.usage.call_limit && (
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit
                        ? "bg-destructive"
                        : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAtLimit
                    ? "You've reached your limit. Upgrade to continue."
                    : isNearLimit
                    ? "You're approaching your limit."
                    : `${Math.round(usagePercentage)}% used`}
                </p>
              </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
              Resets on{" "}
              {new Date(subscription.usage.period_end).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Warning */}
      {isAtLimit && subscription.plan_tier !== "enterprise" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Call limit reached</p>
              <p className="text-sm text-muted-foreground">
                New calls will be blocked until you upgrade or your period resets.
              </p>
            </div>
            <Button
              onClick={() =>
                handleUpgrade(
                  subscription.plan_tier === "free" ? "starter" : "professional"
                )
              }
              className="shrink-0"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.tier === subscription.plan_tier;
            const canUpgrade =
              !isCurrent &&
              PLANS.findIndex((p) => p.tier === plan.tier) >
                PLANS.findIndex((p) => p.tier === subscription.plan_tier);

            return (
              <Card
                key={plan.tier}
                className={`relative ${
                  plan.highlighted
                    ? "border-primary ring-1 ring-primary/20"
                    : ""
                } ${isCurrent ? "bg-primary/5" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-bg text-white text-xs font-medium px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrent && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    {plan.price > 0 ? (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </>
                    ) : plan.tier === "enterprise" ? (
                      <span className="text-3xl font-bold">Custom</span>
                    ) : (
                      <span className="text-3xl font-bold">Free</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {canUpgrade && (
                    <Button
                      className="w-full gap-2"
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          {plan.tier === "enterprise"
                            ? "Contact Sales"
                            : "Upgrade"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}

                  {isCurrent && (
                    <Button className="w-full" variant="secondary" disabled>
                      Current Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
