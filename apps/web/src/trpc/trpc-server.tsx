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
import { webEnv } from "@neuralpay/env/web";
import { headers } from "next/headers";

export const getQueryClient = cache(makeQueryClient);
const getHeaders = cache(async () => {
  const h = await headers();
  const appUrl = new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  );
  return {
    cookie: h.get("cookie") ?? "",
    "x-forwarded-host": appUrl.host,
    "x-forwarded-proto": appUrl.protocol.replace(":", ""),
  };
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${process.env.SERVER_URL}/v1/trpc`,
        transformer: superjson,
        async headers() {
          return getHeaders();
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
