"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Activity, ArrowRight, Phone, Settings, Zap, Link2, AlertCircle, CreditCard } from "lucide-react";
import { shopAPI, billingAPI, type ShopConfig, type SubscriptionInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [shop, setShop] = useState<ShopConfig | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Clerk to fully load before making API calls
    if (!isLoaded) return;

    // Not signed in - middleware should handle redirect, but be safe
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        const token = await getToken();
        if (!token) {
          setError("Unable to get authentication token");
          return;
        }

        const shopData = await shopAPI.getMyShop(token);

        if (!shopData) {
          router.push("/onboarding");
          return;
        }

        setShop(shopData);

        // Load billing info (don't fail if billing isn't set up yet)
        try {
          const billingData = await billingAPI.getSubscription(token);
          setSubscription(billingData);
        } catch {
          // Billing might not be set up yet, that's OK
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shop");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [getToken, router, isLoaded, isSignedIn]);

  // Calculate usage status
  const usagePercentage = subscription?.usage.percentage_used ?? 0;
  const isNearLimit = usagePercentage >= 80 && usagePercentage < 100;
  const isAtLimit = usagePercentage >= 100;
  const showUpgradePrompt = subscription && (isNearLimit || isAtLimit) && subscription.plan_tier !== "enterprise";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Error loading dashboard</p>
        <p className="mt-1 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{shop.name}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your AI receptionist
        </p>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <Card className={`${isAtLimit ? "border-destructive/50 bg-destructive/5" : "border-yellow-500/50 bg-yellow-500/5"}`}>
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className={`h-6 w-6 shrink-0 ${isAtLimit ? "text-destructive" : "text-yellow-500"}`} />
            <div className="flex-1">
              <p className={`font-medium ${isAtLimit ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"}`}>
                {isAtLimit ? "Call limit reached" : "Approaching call limit"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAtLimit
                  ? `You've used all ${subscription.usage.call_limit} calls. New calls will be blocked.`
                  : `You've used ${subscription.usage.call_count} of ${subscription.usage.call_limit} calls (${Math.round(usagePercentage)}%).`}
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/billing")}
              className="shrink-0 gap-2"
              variant={isAtLimit ? "default" : "outline"}
            >
              <CreditCard className="h-4 w-4" />
              {isAtLimit ? "Upgrade Now" : "View Plans"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-3 stagger-children">
        {/* AI Status Card */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Status
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span
                className={`status-dot ${
                  shop.settings.ai_enabled ? "status-dot-active" : "status-dot-inactive"
                }`}
              />
              <span className="text-2xl font-bold">
                {shop.settings.ai_enabled ? "Active" : "Paused"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {shop.settings.ai_enabled
                ? "Answering calls 24/7"
                : "Calls forwarding to transfer number"}
            </p>
          </CardContent>
        </Card>

        {/* Phone Number Card */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phone Number
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Phone className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shop.phone}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered line
            </p>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calls This Month
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{subscription.usage.call_count}</span>
                  <span className="text-muted-foreground">
                    / {subscription.usage.call_limit ?? "∞"}
                  </span>
                </div>
                {subscription.usage.call_limit && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isAtLimit
                            ? "bg-destructive"
                            : isNearLimit
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {subscription.plan_name} plan
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">—</p>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="h-4 w-4" />
            Configure Settings
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/dashboard/calls")}
          >
            <Phone className="h-4 w-4" />
            View Call History
          </Button>
        </CardContent>
      </Card>

      {/* Greeting Preview */}
      <Card>
        <CardHeader>
          <CardTitle>AI Greeting Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl bg-muted/50 p-6">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <p className="relative text-lg italic text-muted-foreground">
              &quot;{shop.settings.greeting_message.replace("{shop_name}", shop.name)}&quot;
            </p>
          </div>
          <Button
            variant="ghost"
            className="mt-4 gap-2 text-primary"
            onClick={() => router.push("/dashboard/settings")}
          >
            Edit greeting
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
