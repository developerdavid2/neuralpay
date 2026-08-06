import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useBudgetSummary() {
  const trpc = useTRPC();
  const query = useSuspenseQuery(
    trpc.payments.budgets.summary.queryOptions(),
  );
  return { ...query, summary: query.data };
}
