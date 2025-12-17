"use client";

import { useMutation } from "@tanstack/react-query";
import { billingAPI, type PlanTier, type CheckoutResponse } from "@/lib/api";
import { useAuthToken } from "@/hooks/use-auth-token";

interface CheckoutParams {
  planTier: PlanTier;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Hook to create a checkout session for upgrading subscription
 */
export function useCheckout() {
  const { getToken } = useAuthToken();

  return useMutation({
    mutationFn: async ({ planTier, successUrl, cancelUrl }: CheckoutParams) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get authentication token");
      }
      return billingAPI.createCheckout(planTier, successUrl, cancelUrl, token);
    },
  });
}

