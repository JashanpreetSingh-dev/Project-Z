"use client";

import { useQuery } from "@tanstack/react-query";
import { billingAPI, type QuotaStatus } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch the current user's quota status
 */
export function useQuota() {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.billing.quota(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return billingAPI.getQuota(token);
    },
    enabled: !isAuthLoading && isSignedIn,
    staleTime: 1000 * 60 * 2, // 2 minutes - quota changes frequently
  });
}

