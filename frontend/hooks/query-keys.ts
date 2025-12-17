/**
 * Centralized query key factory for React Query
 * Ensures consistent key structure across the application
 */

export const queryKeys = {
  shops: {
    all: ["shops"] as const,
    me: () => [...queryKeys.shops.all, "me"] as const,
  },
  calls: {
    all: ["calls"] as const,
    lists: () => [...queryKeys.calls.all, "list"] as const,
    list: (limit?: number) => [...queryKeys.calls.lists(), { limit }] as const,
    details: () => [...queryKeys.calls.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.calls.details(), id] as const,
    analytics: (days?: number) => [...queryKeys.calls.all, "analytics", { days }] as const,
  },
  billing: {
    all: ["billing"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
    quota: () => [...queryKeys.billing.all, "quota"] as const,
  },
  context: {
    all: ["context"] as const,
    customer: (phoneNumber: string) => [...queryKeys.context.all, "customer", phoneNumber] as const,
  },
} as const;

