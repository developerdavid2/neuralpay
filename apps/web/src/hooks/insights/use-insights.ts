// hooks/insights/use-insights.ts
import type { InsightsListInput } from "@/modules/insights/types";
import { useTRPC } from "@/trpc/trpc-client";
import {
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

export function useInsightsList(filters: InsightsListInput) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.ai.insights.list.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  return {
    data: query.data,
    insights: query.data.pages.flatMap((page) => page.items),
    isLoading: query.isPending,
    pages: query.data.pages,
  };
}

export function useInsightsInfiniteScroll(filters: InsightsListInput) {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(
    trpc.ai.insights.list.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  return {
    ...query,
    isLoading: query.isPending,
  };
}

export function useRecentInsights(limit = 5) {
  const trpc = useTRPC();
  const { data: insights, isPending } = useSuspenseQuery(
    trpc.ai.insights.recent.queryOptions({ limit }),
  );
  return { insights, isLoading: isPending };
}

export function useInsightDetail(insightId: string) {
  const trpc = useTRPC();
  const {
    data: insight,
    isPending,
    isError,
  } = useQuery({
    ...trpc.ai.insights.getInsightById.queryOptions({ id: insightId }),
    enabled: !!insightId,
  });

  return {
    insight: insight ?? null,
    isLoading: isPending,
    isError,
  };
}
