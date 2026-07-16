"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useGetSocialSignInUrl(provider: string, callbackURL: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.users.auth.getSocialSignInUrl.queryOptions({ provider, callbackURL }),
  );
}
