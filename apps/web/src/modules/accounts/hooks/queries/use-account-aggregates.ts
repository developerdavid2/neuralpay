import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useAccountAggregates() {
  const trpc = useTRPC();

  const {
    data: aggregates,
    isPending,
    isError,
  } = useSuspenseQuery({
    ...trpc.payments.accounts.aggregateByType.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const aggregateMap = new Map(aggregates.byType.map((a) => [a.type, a]));

  return {
    aggAccType: aggregates.byType,
    aggregateMap,
    totalCount: aggregates.totalCount,
    totalBalance: Number(aggregates.totalBalance),
    isLoading: isPending,
    isError,
  };
}
