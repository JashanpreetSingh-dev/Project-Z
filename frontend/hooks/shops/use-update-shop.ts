"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shopAPI, type ShopConfig, type ShopConfigUpdate } from "@/lib/api";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to update the current user's shop
 */
export function useUpdateShop() {
  const queryClient = useQueryClient();
  const { getToken } = useAuthToken();

  return useMutation({
    mutationFn: async (data: ShopConfigUpdate) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return shopAPI.updateMyShop(data, token);
    },
    onSuccess: (data) => {
      // Invalidate and refetch shop query
      queryClient.setQueryData<ShopConfig | null>(queryKeys.shops.me(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.me() });
    },
  });
}

