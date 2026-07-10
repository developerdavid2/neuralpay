"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSessions() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.users.security.getSessions.queryOptions());
}
