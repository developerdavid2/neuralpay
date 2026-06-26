import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { TxMonthlySummaryFilterInput } from "@neuralpay/types";

export function useTransactionsMonthlySummaries(
  filters: TxMonthlySummaryFilterInput,
) {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.payments.transactions.monthlySummaries.queryOptions(filters, {
      staleTime: 60_000,
    }),
  );
}
