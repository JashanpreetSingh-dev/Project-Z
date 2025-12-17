"use client";

import { useQuery } from "@tanstack/react-query";
import { callsAPI, type CallLog } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch a specific call log by ID
 * @param callId - The ID of the call to fetch
 */
export function useCall(callId: string | undefined) {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.calls.detail(callId ?? ""),
    queryFn: async () => {
      if (!callId) {
        throw new Error("Call ID is required");
      }
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return callsAPI.getCall(callId, token);
    },
    enabled: !isAuthLoading && isSignedIn && !!callId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

