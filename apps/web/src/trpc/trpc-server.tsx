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
import { headers } from "next/headers";
import { webEnv } from "@neuralpay/env/web";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${webEnv.SERVER_URL}/v1/trpc`,
        transformer: superjson,
        async headers() {
          const h = await headers();
          const appUrl = new URL(webEnv.NEXT_PUBLIC_APP_URL);
          return {
            cookie: h.get("cookie") ?? "",
            "x-forwarded-host": appUrl.host,
            "x-forwarded-proto": appUrl.protocol.replace(":", ""),
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
export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(queryOptions);
}

export async function prefetchInfinite<
  T extends ReturnType<TRPCQueryOptions<any>>,
>(queryOptions: T) {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(queryOptions as any);
}

// Add this helper to suppress prefetch errors from crashing the SSR render
export async function safePrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  try {
    await prefetch(queryOptions);
  } catch (error) {
    console.warn(
      `[safePrefetch] Ignored a prefetch failure. This is normal if the user is unauthorized and the layout is about to redirect them.`,
    );
  }
}
