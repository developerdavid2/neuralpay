import { ACCOUNT_TYPE_CONFIG } from "@/modules/accounts/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { ACCOUNT_TYPES } from "@neuralpay/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function useAccountAggregates() {
  const trpc = useTRPC();

  const {
    data: aggAccType,
    isPending,
    isError,
  } = useSuspenseQuery(trpc.payments.accounts.aggregateByType.queryOptions());

  const aggregateMap = new Map(aggAccType?.map((a) => [a.type, a]));

  // Net worth: assets minus credit liabilities
  const totalBalance = ACCOUNT_TYPES.reduce((sum, type) => {
    const agg = aggregateMap?.get(type);
    if (!agg) return sum;
    const config = ACCOUNT_TYPE_CONFIG[type];
    return sum + agg.totalBalance;
  }, 0);

  const totalCount = aggAccType.reduce((sum, a) => sum + a.accountCount, 0);
  return {
    aggAccType,
    aggregateMap,
    totalCount,
    totalBalance,
    isLoading: isPending,
    isError,
  };
}
