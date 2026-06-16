import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useUsage() {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.ai.coach.usage.queryOptions(undefined, {
      staleTime: 60_000,
    }),
    throwOnError: false,
  });
}
