"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useProfile() {
  const trpc = useTRPC();
  return useSuspenseQuery({
    ...trpc.users.profile.me.queryOptions(),
  });
}
