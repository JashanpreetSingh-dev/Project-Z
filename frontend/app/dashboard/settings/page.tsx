"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Settings, MessageSquare, Phone, Timer, Calendar, Link2, X, Clock, Building2, AlertCircle, Info, XCircle } from "lucide-react";
import { type ShopConfigUpdate, calendarAPI } from "@/lib/api";
import { useShop } from "@/hooks/shops/use-shop";
import { useUpdateShop } from "@/hooks/shops/use-update-shop";
import { formatPhoneInput, formatPhoneDisplay } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Select } from "@/components/ui/select";
import { GoogleCalendarLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { data: shop, isLoading, error: shopError, status: shopStatus } = useShop();
  const updateShop = useUpdateShop();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const [calendarStatus, setCalendarStatus] = useState<{ connected: boolean; email?: string } | null>(null);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    greeting_message: "",
    transfer_number: "",
    ai_enabled: true,
    max_call_duration_seconds: 300,
    sms_call_summary_enabled: false,
    calendar_mode: "read_only" as "read_only" | "booking_enabled",
    calendar_provider: "none" as "none" | "google",
    calendar_id: "primary",
    default_duration_minutes: 30,
    business_hours_only: true,
  });

  // Initialize form data when shop loads
  useEffect(() => {
    if (shop) {
      const calendarSettings = shop.settings.calendar_settings || {
        mode: "read_only",
        provider: "none",
        calendar_id: "primary",
        default_duration_minutes: 30,
        business_hours_only: true,
      };
      setFormData({
        name: shop.name,
        phone: formatPhoneDisplay(shop.phone),
        greeting_message: shop.settings.greeting_message,
        transfer_number: formatPhoneDisplay(shop.settings.transfer_number || ""),
        ai_enabled: shop.settings.ai_enabled,
        max_call_duration_seconds: shop.settings.max_call_duration_seconds,
        sms_call_summary_enabled: shop.settings.sms_call_summary_enabled || false,
        calendar_mode: calendarSettings.mode,
        calendar_provider: calendarSettings.provider,
        calendar_id: calendarSettings.calendar_id,
        default_duration_minutes: calendarSettings.default_duration_minutes,
        business_hours_only: calendarSettings.business_hours_only,
      });
    }
  }, [shop]);

  // Load calendar status
  useEffect(() => {
    const loadCalendarStatus = async () => {
      if (!shop || shop.settings.calendar_settings?.provider !== "google") {
        setCalendarStatus({ connected: false });
        return;
      }
      try {
        const token = await getToken();
        if (token) {
          const status = await calendarAPI.getGoogleStatus(token);
          setCalendarStatus(status);
        }
      } catch (error) {
        console.error("Failed to load calendar status:", error);
        setCalendarStatus({ connected: false });
      }
    };
    loadCalendarStatus();
  }, [shop, getToken]);

  // Redirect to onboarding if no shop exists (only if auth is loaded, query has finished, and there's no error)
  useEffect(() => {
    // Only redirect if auth is loaded AND query has completed (success or error status)
    const queryFinished = isAuthLoaded && (shopStatus === 'success' || shopStatus === 'error');
    if (queryFinished && !shop && !shopError) {
      router.push("/onboarding");
    }
  }, [shop, shopError, shopStatus, isAuthLoaded, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!shop) {
      setError("Shop data not loaded");
      return;
    }

    const update: ShopConfigUpdate = {
      name: formData.name,
      phone: formData.phone,
      settings: {
        greeting_message: formData.greeting_message,
        transfer_number: formData.transfer_number || null,
        ai_enabled: formData.ai_enabled,
        max_call_duration_seconds: formData.max_call_duration_seconds,
        sms_call_summary_enabled: formData.sms_call_summary_enabled,
        allowed_intents: shop.settings.allowed_intents || [],
        calendar_settings: {
          mode: formData.calendar_mode,
          provider: formData.calendar_provider,
          calendar_id: formData.calendar_id,
          default_duration_minutes: formData.default_duration_minutes,
          business_hours_only: formData.business_hours_only,
        },
      },
    };

    try {
      await updateShop.mutateAsync(update);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload calendar status after saving to ensure UI is up to date
      if (formData.calendar_provider === "google") {
        const token = await getToken();
        if (token) {
          try {
            const status = await calendarAPI.getGoogleStatus(token);
            setCalendarStatus(status);
          } catch (error) {
            // Ignore errors when reloading status
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setConnectingCalendar(true);
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }
      const response = await calendarAPI.initiateGoogleAuth(token);
      // Open OAuth in new window
      window.open(response.authorization_url, "_blank", "width=600,height=700");
      // Poll for status update
      const checkInterval = setInterval(async () => {
        try {
          const status = await calendarAPI.getGoogleStatus(token);
          if (status.connected) {
            setCalendarStatus(status);
            clearInterval(checkInterval);
            setConnectingCalendar(false);
          }
        } catch (error) {
          // Ignore errors during polling
        }
      }, 2000);
      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        setConnectingCalendar(false);
      }, 300000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Google Calendar");
      setConnectingCalendar(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }
      await calendarAPI.disconnectGoogle(token);
      setCalendarStatus({ connected: false });
      setFormData({ ...formData, calendar_provider: "none", calendar_mode: "read_only" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect Google Calendar");
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

  if (shopError) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Error loading settings</p>
        <p className="mt-1 text-sm opacity-80">{shopError instanceof Error ? shopError.message : "Failed to load settings"}</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout - 2 Columns: Left (Shop Settings + Greeting), Right (Call Settings + Calendar) */}
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: "1fr 2fr",
            gridAutoRows: "minmax(min-content, auto)"
          }}
        >
          {/* Left Column - Top: Basic Info & AI & SMS Toggles */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-1.5 flex-shrink-0">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Shop Settings</CardTitle>
                  <CardDescription className="text-xs">Basic information and AI controls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {/* Basic Information */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Shop Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-background h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Business Phone (Twilio Number)</Label>
                  <Input
                    type="tel"
                    id="phone"
                    required
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhoneInput(e.target.value) })
                    }
                    className="bg-background h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twilio phone number for receiving calls
                  </p>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t my-3" />

              {/* AI Receptionist Toggle */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5 flex-1">
                  <div
                    className={`rounded-lg p-1.5 transition-colors ${
                      formData.ai_enabled ? "bg-green-500/10" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`status-dot ${
                        formData.ai_enabled ? "status-dot-active" : "status-dot-inactive"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">AI Receptionist</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.ai_enabled
                        ? "Answering calls automatically"
                        : "Calls go to transfer number"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.ai_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ai_enabled: checked })
                  }
                />
              </div>

              {/* SMS Call Summaries Toggle */}
              <div className="flex items-center justify-between py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">SMS Call Summaries</p>
                  <p className="text-xs text-muted-foreground">
                    Send customers brief summaries after resolved calls
                  </p>
                </div>
                <Switch
                  checked={formData.sms_call_summary_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sms_call_summary_enabled: checked })
                  }
                />
              </div>
              {formData.sms_call_summary_enabled && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-xs mt-2">
                  <p className="text-blue-600 dark:text-blue-400">
                    💡 SMS summaries sent automatically. Customers can opt out by replying &quot;STOP&quot;.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Top: Call Settings & Greeting Message */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-1.5 flex-shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Call Settings & Greeting</CardTitle>
                  <CardDescription className="text-xs">Configure call behavior and greeting message</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {/* Call Settings */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="transfer" className="text-sm">Transfer Number</Label>
                  <Input
                    type="tel"
                    id="transfer"
                    placeholder="(555) 123-4567"
                    value={formData.transfer_number}
                    onChange={(e) =>
                      setFormData({ ...formData, transfer_number: formatPhoneInput(e.target.value) })
                    }
                    className="bg-background h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calls transfer here when the AI can&apos;t help
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="flex items-center gap-2 text-sm">
                    <Timer className="h-3.5 w-3.5" />
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
                      className="bg-background h-9"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">seconds</span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t my-3" />

              {/* Greeting Message */}
              <div className="space-y-2">
                <Label htmlFor="greeting" className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Greeting Message
                </Label>
                <Textarea
                  id="greeting"
                  rows={3}
                  value={formData.greeting_message}
                  onChange={(e) =>
                    setFormData({ ...formData, greeting_message: e.target.value })
                  }
                  className="bg-background resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Use <code className="rounded bg-muted px-1 py-0.5">{"{shop_name}"}</code> to insert your shop name dynamically
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Bottom: Calendar Integration */}
          <Card className="border-2 flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1.5 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">Appointment Booking</CardTitle>
                  <CardDescription className="text-xs">
                    Let your AI receptionist schedule appointments directly in your calendar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
            {/* Step 1: Calendar Provider Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  1
                </div>
                <Label htmlFor="calendar-provider" className="text-base font-semibold">
                  Choose Calendar Provider
                </Label>
              </div>
              <Select
                id="calendar-provider"
                value={formData.calendar_provider}
                onValueChange={(value) => {
                  const provider = value as "none" | "google";
                  setFormData({
                    ...formData,
                    calendar_provider: provider,
                    calendar_mode: provider === "none" ? "read_only" : formData.calendar_mode,
                  });
                }}
                options={[
                  {
                    value: "none",
                    label: "No calendar integration",
                    icon: XCircle,
                  },
                  {
                    value: "google",
                    label: "Google Calendar",
                    icon: GoogleCalendarLogo,
                  },
                ]}
                placeholder="Select a calendar provider"
                className="h-11"
              />
              {formData.calendar_provider === "none" && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Select a calendar provider to enable appointment booking features.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Connection Status */}
            {formData.calendar_provider === "google" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    2
                  </div>
                  <Label className="text-base font-semibold">Connect Your Calendar</Label>
                </div>
                <div className="rounded-xl border-2 bg-gradient-to-br from-background to-muted/30 p-5">
                  {calendarStatus?.connected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-500 p-2 shadow-lg shadow-green-500/20">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              Successfully Connected
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {calendarStatus.email && calendarStatus.email !== "Unknown" 
                                ? calendarStatus.email 
                                : "Google Calendar"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnectGoogle}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-muted p-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Not Connected</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connect your Google Calendar to allow the AI to check availability and create appointments.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleConnectGoogle}
                        disabled={connectingCalendar}
                        className="w-full gradient-bg border-0 shadow-lg hover:shadow-xl transition-shadow"
                        size="lg"
                      >
                        {connectingCalendar ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Connecting to Google...
                          </>
                        ) : (
                          <>
                            <Link2 className="mr-2 h-5 w-5" />
                            Connect Google Calendar
                          </>
                        )}
                      </Button>
                      <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          You&apos;ll be redirected to Google to authorize access. We only request permission to read and create calendar events.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Enable Booking & Configuration */}
            {formData.calendar_provider === "google" && calendarStatus?.connected && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    3
                  </div>
                  <Label className="text-base font-semibold">Configure Booking Settings</Label>
                </div>

                {/* Enable Booking Toggle */}
                <div className="rounded-lg border-2 bg-gradient-to-br from-background to-muted/20 p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Enable Appointment Booking</p>
                        {formData.calendar_mode === "booking_enabled" && (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        When enabled, the AI can check your calendar availability and create appointments after customer confirmation.
                      </p>
                    </div>
                    <Switch
                      checked={formData.calendar_mode === "booking_enabled"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          calendar_mode: checked ? "booking_enabled" : "read_only",
                        })
                      }
                    />
                  </div>
                </div>

                {/* Configuration Options */}
                {formData.calendar_mode === "booking_enabled" && (
                  <div className="space-y-4 rounded-xl border-2 bg-gradient-to-br from-background to-muted/30 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Booking Preferences
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="calendar-id" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Calendar ID
                        </Label>
                        <Input
                          id="calendar-id"
                          value={formData.calendar_id}
                          onChange={(e) =>
                            setFormData({ ...formData, calendar_id: e.target.value })
                          }
                          className="bg-background"
                          placeholder="primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Usually &quot;primary&quot; for your main calendar
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Default Duration
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            id="duration"
                            min={15}
                            max={60}
                            step={15}
                            value={formData.default_duration_minutes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                default_duration_minutes: parseInt(e.target.value) || 30,
                              })
                            }
                            className="bg-background"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">minutes</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Default appointment length (15-60 minutes)
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Business Hours Only</p>
                            {formData.business_hours_only && (
                              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                Enabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Restrict appointments to business hours (9 AM - 5 PM, Monday-Friday)
                          </p>
                        </div>
                        <Switch
                          checked={formData.business_hours_only}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, business_hours_only: checked })
                          }
                        />
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p className="font-medium">How it works:</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          <li>AI checks your calendar for available time slots</li>
                          <li>Proposes a specific appointment time to the caller</li>
                          <li>Only creates the appointment after explicit customer confirmation</li>
                          <li>All booking attempts are logged for your review</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          </Card>
        </div>

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
          <Button type="submit" disabled={updateShop.isPending} className="gradient-bg border-0 px-8">
            {updateShop.isPending ? (
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
