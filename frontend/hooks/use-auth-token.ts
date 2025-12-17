"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Hook to get Clerk authentication state and token getter
 * Returns helper functions and state for authentication
 */
export function useAuthToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return {
    isLoading: !isLoaded,
    isSignedIn: isSignedIn ?? false,
    getToken: async () => {
      if (!isLoaded || !isSignedIn) {
        return null;
      }
      return await getToken();
    },
  };
}

