import type { InsightsListInput } from "@/modules/insights/types";
import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function useInsightsList(filters: InsightsListInput) {
  const trpc = useTRPC();

  console.log(filters);
  const { data: insights, isLoading } = useSuspenseQuery(
    trpc.ai.insights.list.queryOptions(filters),
  );

  return {
    insights: insights,
    isLoading,
  };
}

export function useRecentInsights(limit = 5) {
  const trpc = useTRPC();

  const { data: insights, isLoading } = useSuspenseQuery(
    trpc.ai.insights.recent.queryOptions({ limit }),
  );

  return {
    insights,
    isLoading,
  };
}

export function useInsightDetail(insightId: string) {
  const trpc = useTRPC();

  const {
    data: insight,
    isLoading,
    isError,
  } = useQuery({
    ...trpc.ai.insights.getInsightById.queryOptions({ id: insightId }),
    enabled: !!insightId && insightId !== "",
  });

  return {
    insight: insight ?? null,
    isLoading,
    isError,
  };
}
