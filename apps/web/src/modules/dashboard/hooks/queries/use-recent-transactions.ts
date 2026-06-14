import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRecentTransactions(limit = TRANSACTIONS_LIMIT) {
  const trpc = useTRPC();
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.recent.queryOptions({ limit }),
  );

  return { recentTransactions };
}
