"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Activity, ArrowRight, Phone, Settings, Zap, Link2 } from "lucide-react";
import { shopAPI, type ShopConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [shop, setShop] = useState<ShopConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      try {
        const token = await getToken();
        if (!token) return;

        const shopData = await shopAPI.getMyShop(token);

        if (!shopData) {
          router.push("/onboarding");
          return;
        }

        setShop(shopData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shop");
      } finally {
        setIsLoading(false);
      }
    }

    loadShop();
  }, [getToken, router]);

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

        {/* Adapter Card */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Source
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{shop.adapter_type}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {shop.adapter_type === "mock" ? "Demo data" : "Live sync"}
            </p>
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
