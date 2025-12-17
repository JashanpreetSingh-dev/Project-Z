"use client";

import { useQuery } from "@tanstack/react-query";
import { shopAPI, type ShopConfig } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to fetch the current user's shop
 */
export function useShop() {
  const { getToken, isLoading: isAuthLoading, isSignedIn } = useAuthToken();

  return useQuery({
    queryKey: queryKeys.shops.me(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return shopAPI.getMyShop(token);
    },
    enabled: !isAuthLoading && isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

