import { useAccountAggregates } from "@/modules/accounts/hooks/queries/use-account-aggregates";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useStatCards() {
  const trpc = useTRPC();

  const { totalBalance, totalCount, aggregateMap } = useAccountAggregates();
  const { data: monthSpending } = useSuspenseQuery({
    ...trpc.payments.transactions.currentMonthSpending.queryOptions(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const savingsBalance = Number(aggregateMap.get("savings")?.totalBalance ?? 0);
  const savingsRate =
    totalBalance > 0 ? (savingsBalance / totalBalance) * 100 : 0;
  return {
    totalBalance,
    monthSpending,
    savingsRate,
    totalCount,
  };
}
