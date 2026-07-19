"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function useProfile() {
  const trpc = useTRPC();
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    ...trpc.users.profile.me.queryOptions(),
  });

  return {
    profile: profile ?? null,
    isLoading,
    isError,
  };
}
