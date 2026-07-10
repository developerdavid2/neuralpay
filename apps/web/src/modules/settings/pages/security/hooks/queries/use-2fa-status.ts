"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function use2FAStatus() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.users.security.get2FAStatus.queryOptions());
}
