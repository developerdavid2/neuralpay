import "server-only";

import { cache } from "react";

import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";

import { createTRPCClient, httpLink } from "@trpc/client";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import superjson from "superjson";

import type { AppRouter } from "@neuralpay/api-gateway/router";

import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/trpc`,
        transformer: superjson,

        async headers() {
          const { headers } = await import("next/headers");
          const h = await headers();
          return {
            cookie: h.get("cookie") ?? "",
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  }),

  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(queryOptions);
}

export function prefetchInfinite<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(queryOptions as any);
}
