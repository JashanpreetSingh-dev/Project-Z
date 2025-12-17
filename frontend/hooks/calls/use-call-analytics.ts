"use client";

import { useQuery } from "@tanstack/react-query";
import { callsAPI, type CallAnalytics } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch call analytics for the current user's shop
 * @param days - Number of days to analyze (default: 30)
 */
export function useCallAnalytics(days: number = 30) {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.calls.analytics(days),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return callsAPI.getAnalytics(token, days);
    },
    enabled: !isAuthLoading && isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

