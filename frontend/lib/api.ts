/**
 * API client for communicating with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Base fetch wrapper with auth and error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ============================================
// Shop API
// ============================================

export interface CalendarSettings {
  mode: "read_only" | "booking_enabled";
  provider: "none" | "google";
  calendar_id: string;
  default_duration_minutes: number;
  business_hours_only: boolean;
  credentials?: {
    connected?: boolean;
    email?: string;
    [key: string]: unknown;
  };
}

export interface ShopSettings {
  ai_enabled: boolean;
  transfer_number: string | null;
  allowed_intents: string[];
  greeting_message: string;
  max_call_duration_seconds: number;
  sms_call_summary_enabled: boolean;
  sms_from_number: string | null;
  calendar_settings?: CalendarSettings;
}

export interface ShopConfig {
  id: string;
  owner_id: string;
  name: string;
  phone: string;
  adapter_type: "mock" | "tekmetric" | "shopware";
  settings: ShopSettings;
  created_at: string;
  updated_at: string;
}

export interface ShopConfigCreate {
  name: string;
  phone: string;
  adapter_type?: "mock" | "tekmetric" | "shopware";
  settings?: Partial<ShopSettings>;
}

export interface ShopConfigUpdate {
  name?: string;
  phone?: string;
  adapter_type?: "mock" | "tekmetric" | "shopware";
  settings?: Partial<ShopSettings>;
}

export const shopAPI = {
  /**
   * Get the current user's shop
   */
  getMyShop: (token: string): Promise<ShopConfig | null> =>
    fetchAPI<ShopConfig | null>("/api/shops/me", {}, token),

  /**
   * Create a shop for the current user
   */
  createMyShop: (data: ShopConfigCreate, token: string): Promise<ShopConfig> =>
    fetchAPI<ShopConfig>(
      "/api/shops/me",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  /**
   * Update the current user's shop
   */
  updateMyShop: (data: ShopConfigUpdate, token: string): Promise<ShopConfig> =>
    fetchAPI<ShopConfig>(
      "/api/shops/me",
      { method: "PATCH", body: JSON.stringify(data) },
      token
    ),

  /**
   * Delete the current user's shop
   */
  deleteMyShop: (token: string): Promise<void> =>
    fetchAPI<void>("/api/shops/me", { method: "DELETE" }, token),
};

// ============================================
// Calls API
// ============================================

export interface CallLog {
  id: string;
  shop_id: string;
  work_order_id: string | null;
  call_sid: string | null;
  caller_number: string | null;
  timestamp: string;
  duration_seconds: number | null;
  intent: string;
  confidence: number;
  outcome: string;
  slots: Record<string, unknown>;
  tool_called: string | null;
  tool_results: Record<string, unknown>;
  fallback_used: boolean;
  transfer_reason: string | null;
  metadata: Record<string, unknown>;
}

export interface DailyCallCount {
  date: string;
  count: number;
}

export interface CallAnalytics {
  period_start: string;
  period_end: string;
  total_calls: number;
  avg_duration_seconds: number | null;
  calls_by_day: DailyCallCount[];
  outcomes: Record<string, number>;
  resolution_rate: number;
  intents: Record<string, number>;
  calls_by_hour: Record<string, number>;
}

export const callsAPI = {
  /**
   * Get call logs for the current user's shop
   */
  getMyCalls: (token: string, limit = 100): Promise<CallLog[]> =>
    fetchAPI<CallLog[]>(`/api/calls/me?limit=${limit}`, {}, token),

  /**
   * Get a specific call log
   */
  getCall: (callId: string, token: string): Promise<CallLog> =>
    fetchAPI<CallLog>(`/api/calls/me/${callId}`, {}, token),

  /**
   * Get call analytics for the current user's shop
   */
  getAnalytics: (token: string, days = 30): Promise<CallAnalytics> =>
    fetchAPI<CallAnalytics>(`/api/calls/me/analytics?days=${days}`, {}, token),
};

// ============================================
// Billing API
// ============================================

export type PlanTier = "free" | "starter" | "professional" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface UsageInfo {
  call_count: number;
  call_limit: number | null;
  period_start: string;
  period_end: string;
  percentage_used: number;
}

export interface SubscriptionInfo {
  plan_tier: PlanTier;
  plan_name: string;
  status: SubscriptionStatus;
  price_monthly: number;
  usage: UsageInfo;
  stripe_customer_id: string | null;
  current_period_start: string;
  current_period_end: string;
}

export interface QuotaStatus {
  allowed: boolean;
  calls_remaining: number | null;
  plan_tier: PlanTier;
  upgrade_required: boolean;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

export const billingAPI = {
  /**
   * Get current subscription and usage
   */
  getSubscription: (token: string): Promise<SubscriptionInfo> =>
    fetchAPI<SubscriptionInfo>("/api/billing/subscription", {}, token),

  /**
   * Check quota status
   */
  getQuota: (token: string): Promise<QuotaStatus> =>
    fetchAPI<QuotaStatus>("/api/billing/quota", {}, token),

  /**
   * Create checkout session for upgrading
   */
  createCheckout: (
    planTier: PlanTier,
    successUrl: string,
    cancelUrl: string,
    token: string
  ): Promise<CheckoutResponse> =>
    fetchAPI<CheckoutResponse>(
      "/api/billing/checkout",
      {
        method: "POST",
        body: JSON.stringify({
          plan_tier: planTier,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      },
      token
    ),

  /**
   * Create customer portal session
   */
  createPortal: (returnUrl: string, token: string): Promise<PortalResponse> =>
    fetchAPI<PortalResponse>(
      "/api/billing/portal",
      {
        method: "POST",
        body: JSON.stringify({ return_url: returnUrl }),
      },
      token
    ),
};

// ============================================
// Customer Context API
// ============================================

export interface InteractionRecord {
  channel: "voice" | "sms";
  timestamp: string;
  intent: string | null;
  summary: string | null;
  outcome: string | null;
}

export interface CustomerContext {
  id: string;
  phone_number: string;
  shop_id: string;
  last_interaction: string;
  interactions: InteractionRecord[];
  known_info: {
    name?: string | null;
    vehicles?: Array<{ make?: string; model?: string; year?: number }>;
    active_work_orders?: string[];
  };
}

export const contextAPI = {
  /**
   * Get customer context by phone number
   */
  getCustomerContext: (phoneNumber: string, token: string): Promise<CustomerContext> =>
    fetchAPI<CustomerContext>(`/api/context/customer/${encodeURIComponent(phoneNumber)}`, {}, token),
};

// ============================================
// Calendar API
// ============================================

export interface CalendarAuthResponse {
  authorization_url: string;
}

export interface CalendarStatusResponse {
  connected: boolean;
  provider: string;
  email?: string;
}

export interface CalendarDisconnectResponse {
  success: boolean;
  message: string;
}

export const calendarAPI = {
  /**
   * Initiate Google Calendar OAuth flow
   */
  initiateGoogleAuth: (token: string): Promise<CalendarAuthResponse> =>
    fetchAPI<CalendarAuthResponse>("/api/calendar/google/auth", {}, token),

  /**
   * Get Google Calendar connection status
   */
  getGoogleStatus: (token: string): Promise<CalendarStatusResponse> =>
    fetchAPI<CalendarStatusResponse>("/api/calendar/google/status", {}, token),

  /**
   * Disconnect Google Calendar
   */
  disconnectGoogle: (token: string): Promise<CalendarDisconnectResponse> =>
    fetchAPI<CalendarDisconnectResponse>(
      "/api/calendar/google/disconnect",
      { method: "POST" },
      token
    ),
};
