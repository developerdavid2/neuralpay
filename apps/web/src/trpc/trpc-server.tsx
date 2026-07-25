import "server-only";

import type { AppRouter } from "@neuralpay/api-gateway/router";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCInfiniteQueryOptions,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { cache } from "react";
import "server-only";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${process.env.SERVER_URL}/v1/trpc`,
        transformer: superjson,
        async headers() {
          const h = await headers();
          const cookie = h.get("cookie") ?? "";
          const appUrl = new URL(
            process.env.NEXT_PUBLIC_APP_URL ?? "https://neuralpayai.vercel.app",
          );
          return {
            cookie,
            "x-forwarded-host": appUrl.host,
            "x-forwarded-proto": "https",
          };
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

// Changed to return the prefetch Promise
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

export async function prefetchInfinite<
  T extends ReturnType<TRPCQueryOptions<any>>,
>(queryOptions: T) {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(queryOptions as any);
}
