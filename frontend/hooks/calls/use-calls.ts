"use client";

import { useQuery } from "@tanstack/react-query";
import { callsAPI, type CallLog } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch call logs for the current user's shop
 * @param limit - Maximum number of calls to fetch (default: 100)
 */
export function useCalls(limit: number = 100) {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.calls.list(limit),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      const calls = await callsAPI.getMyCalls(token, limit);
      // Sort calls by timestamp (newest first)
      return [...calls].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    },
    enabled: !isAuthLoading && isSignedIn,
    staleTime: 1000 * 60 * 2, // 2 minutes - calls data changes frequently
  });
}

