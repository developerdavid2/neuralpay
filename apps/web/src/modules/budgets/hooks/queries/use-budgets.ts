import { useTRPC } from "@/trpc/trpc-client";
import type { BudgetsFilterInput } from "@neuralpay/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useBudgetsList(filters: BudgetsFilterInput) {
  const trpc = useTRPC();
  const query = useSuspenseQuery(
    trpc.payments.budgets.list.queryOptions(filters),
  );

  return {
    ...query,
    budgets: query.data ?? [],
    isLoading: query.isPending,
  };
}
