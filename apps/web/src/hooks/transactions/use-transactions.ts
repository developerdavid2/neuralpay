import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTransactions(limit = TRANSACTIONS_LIMIT) {
  const trpc = useTRPC();
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.list.queryOptions({ limit }),
  );

  return { recentTransactions };
}

export function useSpendingOverview(params: {
  period: "7d" | "30d" | "90d" | "custom";
  from?: string;
  to?: string;
}) {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.payments.transactions.spendingOverview.queryOptions(params),
  );
}
