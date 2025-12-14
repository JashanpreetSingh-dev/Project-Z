"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { shopAPI, type ShopConfig, type ShopConfigUpdate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
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
  }, [getToken, router]);

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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground">Configure your AI receptionist</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>AI Receptionist</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the AI for incoming calls
                </p>
              </div>
              <Switch
                checked={formData.ai_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ai_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting Message</Label>
              <Textarea
                id="greeting"
                rows={3}
                value={formData.greeting_message}
                onChange={(e) =>
                  setFormData({ ...formData, greeting_message: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Use {"{shop_name}"} to insert your shop name
              </p>
            </div>

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
              />
              <p className="text-xs text-muted-foreground">
                Calls will be transferred here when the AI can&apos;t help
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Max Call Duration (seconds)</Label>
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-100 p-4 text-green-800">
            Settings saved successfully!
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
