import "server-only";

import { cache } from "react";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { headers } from "next/headers";

import superjson from "superjson";

import type { AppRouter } from "@neuralpay/api-gateway/router";

import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/trpc`,

        transformer: superjson,

        async headers() {
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
