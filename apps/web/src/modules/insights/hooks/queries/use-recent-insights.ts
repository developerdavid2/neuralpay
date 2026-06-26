import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRecentInsights(limit = 5) {
  const trpc = useTRPC();
  const { data: insights, isPending } = useSuspenseQuery({
    ...trpc.ai.insights.recent.queryOptions({ limit }),
    staleTime: 300_000,
  });
  return { insights, isLoading: isPending };
}
