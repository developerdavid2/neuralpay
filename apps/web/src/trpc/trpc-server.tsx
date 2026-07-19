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
        url: `${process.env.SERVER_URL}/v1/trpc`,
        transformer: superjson,
        async headers() {
          const h = await headers();
          const cookie = h.get("cookie") ?? "";
          const appUrl = new URL(
            process.env.NEXT_PUBLIC_APP_URL ?? "https://neuralpayai.vercel.app",
          );

          console.log("[trpc-server] cookie present:", !!cookie);
          console.log("[trpc-server] cookie length:", cookie.length);

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
