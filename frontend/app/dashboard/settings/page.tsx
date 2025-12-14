"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, Loader2, Settings, MessageSquare, Phone, Timer } from "lucide-react";
import { shopAPI, type ShopConfig, type ShopConfigUpdate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [shop, setShop] = useState<ShopConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    greeting_message: "",
    transfer_number: "",
    ai_enabled: true,
    max_call_duration_seconds: 300,
  });

  useEffect(() => {
    // Wait for Clerk to fully load before making API calls
    if (!isLoaded) return;

    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadShop() {
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
        setFormData({
          name: shopData.name,
          phone: shopData.phone,
          greeting_message: shopData.settings.greeting_message,
          transfer_number: shopData.settings.transfer_number || "",
          ai_enabled: shopData.settings.ai_enabled,
          max_call_duration_seconds: shopData.settings.max_call_duration_seconds,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shop");
      } finally {
        setIsLoading(false);
      }
    }

    loadShop();
  }, [getToken, router, isLoaded, isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const update: ShopConfigUpdate = {
        name: formData.name,
        phone: formData.phone,
        settings: {
          greeting_message: formData.greeting_message,
          transfer_number: formData.transfer_number || null,
          ai_enabled: formData.ai_enabled,
          max_call_duration_seconds: formData.max_call_duration_seconds,
          allowed_intents: shop?.settings.allowed_intents || [],
        },
      };

      const updated = await shopAPI.updateMyShop(update, token);
      setShop(updated);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure your AI receptionist
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your shop&apos;s identity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Toggle */}
        <Card className="hover-lift">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-lg p-3 transition-colors ${
                  formData.ai_enabled ? "bg-green-500/10" : "bg-muted"
                }`}
              >
                <span
                  className={`status-dot ${
                    formData.ai_enabled ? "status-dot-active" : "status-dot-inactive"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold">AI Receptionist</p>
                <p className="text-sm text-muted-foreground">
                  {formData.ai_enabled
                    ? "Active and answering calls"
                    : "Paused - calls go to transfer number"}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.ai_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, ai_enabled: checked })
              }
            />
          </CardContent>
        </Card>

        {/* Greeting */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Greeting Message</CardTitle>
                <CardDescription>What the AI says when answering</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="greeting"
              rows={3}
              value={formData.greeting_message}
              onChange={(e) =>
                setFormData({ ...formData, greeting_message: e.target.value })
              }
              className="bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground">
              💡 Use <code className="rounded bg-muted px-1 py-0.5">{"{shop_name}"}</code> to insert your shop name dynamically
            </p>
          </CardContent>
        </Card>

        {/* Call Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Call Settings</CardTitle>
                <CardDescription>Configure call behavior</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transfer">Transfer Number</Label>
              <Input
                type="tel"
                id="transfer"
                placeholder="+1 (555) 123-4567"
                value={formData.transfer_number}
                onChange={(e) =>
                  setFormData({ ...formData, transfer_number: e.target.value })
                }
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Calls transfer here when the AI can&apos;t help
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Max Call Duration
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  id="duration"
                  min={60}
                  max={600}
                  value={formData.max_call_duration_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_call_duration_seconds: parseInt(e.target.value) || 300,
                    })
                  }
                  className="bg-background"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            <p>Settings saved successfully!</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gradient-bg border-0 px-8">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
