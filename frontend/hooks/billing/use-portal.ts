"use client";

import { useMutation } from "@tanstack/react-query";
import { billingAPI, type PortalResponse } from "@/lib/api";
import { useAuthToken } from "@/hooks/use-auth-token";

/**
 * Hook to create a customer portal session
 */
export function usePortal() {
  const { getToken } = useAuthToken();

  return useMutation({
    mutationFn: async (returnUrl: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return billingAPI.createPortal(returnUrl, token);
    },
  });
}

