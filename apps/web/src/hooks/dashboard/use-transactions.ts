import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTransactions(limit = 7) {
  const trpc = useTRPC();
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.list.queryOptions({ limit }),
  );

  return { recentTransactions };
}
