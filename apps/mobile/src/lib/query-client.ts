import { QueryClient } from "@tanstack/react-query";

/**
 * The app's one TanStack Query cache. The library is local SQLite
 * (`@synq/db`), so its reads never go stale on their own: writes update or
 * invalidate the queries they affect, and nothing refetches on focus,
 * reconnect, or a timer.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      networkMode: "always",
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    },
    mutations: { networkMode: "always", retry: false },
  },
});
