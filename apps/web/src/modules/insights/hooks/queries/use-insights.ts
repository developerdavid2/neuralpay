"use client";

import type { InsightsListInput } from "@/modules/insights/types";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useInsightsList(filters: InsightsListInput) {
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
