import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useUsage() {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.ai.coach.usage.queryOptions(undefined, {
      staleTime: 60_000,
    }),
  );
}
