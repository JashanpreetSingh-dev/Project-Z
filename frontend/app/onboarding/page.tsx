"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { shopAPI, type ShopConfigCreate } from "@/lib/api";
import { useShop } from "@/hooks/shops/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { data: shop, isLoading: isShopLoading, status: shopStatus } = useShop();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ShopConfigCreate>({
    name: "",
    phone: "",
  });

  // Redirect to dashboard if shop already exists
  useEffect(() => {
    // Only redirect if:
    // 1. Auth is loaded
    // 2. Shop query has completed (success or error status)
    // 3. Shop exists
    const queryFinished = isLoaded && (shopStatus === 'success' || shopStatus === 'error');
    if (queryFinished && shop) {
      router.push("/dashboard");
    }
  }, [shop, shopStatus, isLoaded, router]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/onboarding");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Wait for Clerk to be ready
    if (!isLoaded) {
      setError("Authentication is loading, please try again");
      setIsLoading(false);
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/onboarding");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        router.push("/sign-in?redirect_url=/onboarding");
        return;
      }

      await shopAPI.createMyShop(formData, token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shop");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth and shop
  const isChecking = !isLoaded || isShopLoading || (isLoaded && isSignedIn && shopStatus !== 'success' && shopStatus !== 'error');

  if (isChecking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if shop exists (will redirect via useEffect)
  if (shop) {
    return null;
  }

  // Don't render if not signed in (will redirect via useEffect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-tl from-primary/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">Voice AI</span>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Set Up Your Shop</CardTitle>
            <CardDescription className="text-base">
              Let&apos;s get your AI receptionist ready in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Mike's Auto Repair"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  required
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-12 bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  This is the number your AI receptionist will answer
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 gradient-bg border-0 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Shop
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-2 w-8 rounded-full gradient-bg" />
          <div className="h-2 w-8 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Step 1 of 3 — Basic Info
        </p>
      </div>
    </div>
  );
}
