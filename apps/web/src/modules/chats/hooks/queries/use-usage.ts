import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useUsage() {
  const trpc = useTRPC();

  // Use useQuery instead of useSuspenseQuery to prevent suspension on errors
  return useQuery({
    ...trpc.ai.coach.usage.queryOptions(undefined, {
      staleTime: 60_000,
    }),
    // Don't throw on error - allow component to render with undefined data
    throwOnError: false,
  });
}
