"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { shopAPI, type ShopConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {shop.name}</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your AI receptionist
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Status</CardTitle>
            <span className="text-2xl">
              {shop.settings.ai_enabled ? "🟢" : "🔴"}
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {shop.settings.ai_enabled ? "Active" : "Paused"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Phone Number</CardTitle>
            <span className="text-2xl">📞</span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shop.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Adapter</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shop.adapter_type.toUpperCase()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/settings")}>
            Configure Settings
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/calls")}>
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
          <div className="rounded-lg bg-muted p-4">
            <p className="italic text-muted-foreground">
              &quot;{shop.settings.greeting_message.replace("{shop_name}", shop.name)}&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
