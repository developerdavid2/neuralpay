"use client";

import type { AppRouter } from "@neuralpay/api-gateway/router";
import { webEnv } from "@neuralpay/env/web";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// function getUrl() {
//   const base = (() => {
//     if (typeof window !== "undefined") return "";
//     if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
//     return webEnv.NEXT_PUBLIC_SERVER_URL! ?? "http://localhost:4000";
//   })();
//   return `${base}/v1/trpc`;
// }

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();
  const isProd =
    webEnv.NEXT_PUBLIC_APP_URL.includes("vercel.app") ||
    !webEnv.NEXT_PUBLIC_APP_URL.includes("localhost");

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpLink({
          transformer: superjson,
          url: isProd
            ? `/api/trpc`
            : `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/trpc`,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" });
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
