import type { InsightsListInput } from "@/modules/insights/types";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useInsightsList(filters: InsightsListInput = {}) {
  const trpc = useTRPC();

  const { data: insights, isLoading } = useSuspenseQuery(
    trpc.ai.insights.list.queryOptions(filters),
  );

  return {
    insights: insights,
    isLoading,
  };
}

export function useRecentInsights(limit = 3) {
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
  } = useSuspenseQuery(
    trpc.ai.insights.getInsightById.queryOptions({ id: insightId }),
  );

  return {
    insight,
    isLoading,
    isError,
  };
}
