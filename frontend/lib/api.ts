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

export interface ShopSettings {
  ai_enabled: boolean;
  transfer_number: string | null;
  allowed_intents: string[];
  greeting_message: string;
  max_call_duration_seconds: number;
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
};
