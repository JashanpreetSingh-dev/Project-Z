"use client";

import { useQuery } from "@tanstack/react-query";
import { contextAPI, type CustomerContext } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch customer context by phone number
 * @param phoneNumber - The phone number to fetch context for (can be null/undefined)
 */
export function useCustomerContext(phoneNumber: string | null | undefined) {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.context.customer(phoneNumber ?? ""),
    queryFn: async () => {
      if (!phoneNumber) {
        throw new Error("Phone number is required");
      }
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return contextAPI.getCustomerContext(phoneNumber, token);
    },
    enabled: !isAuthLoading && isSignedIn && !!phoneNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Context might not exist yet, so don't retry too much
  });
}

