"use client";

import { useQuery } from "@tanstack/react-query";
import { billingAPI, type SubscriptionInfo } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch the current user's subscription information
 */
export function useSubscription() {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return billingAPI.getSubscription(token);
    },
    enabled: !isAuthLoading && isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Billing might not be set up yet, so don't retry too much
  });
}

