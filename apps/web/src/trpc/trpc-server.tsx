import "server-only";

import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { cache } from "react";
import type { AppRouter } from "@neuralpay/api/routers/index";
import { env } from "@neuralpay/env/web";
import { makeQueryClient } from "./query-client"; // ← from neutral file

// Stable QueryClient per request
export const getQueryClient = cache(makeQueryClient);

// tRPC proxy — uses HTTP client because router is on separate server
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${env.NEXT_PUBLIC_SERVER_URL}/v1/trpc`,
        async headers() {
          const h = await headers();
          return { cookie: h.get("cookie") ?? "" };
        },
      }),
    ],
  }),
  queryClient: getQueryClient,
});

// ── Helpers (same pattern as the codebase you showed) ─────────────────────

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
