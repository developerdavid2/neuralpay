import { INSIGHTS_LIMIT } from "@/modules/dashboard/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRecentInsights(limit = INSIGHTS_LIMIT) {
  const trpc = useTRPC();
  const { data: insights, isPending } = useSuspenseQuery(
    trpc.ai.insights.recent.queryOptions({ limit }),
  );
  return { insights, isLoading: isPending };
}
