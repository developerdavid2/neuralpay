import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTransactionsMonthlySummaries(filters: {
  dateFrom?: string;
  dateTo?: string;
  bankAccountId?: string;
}) {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.payments.transactions.monthlySummaries.queryOptions(filters, {
      staleTime: 60_000,
    }),
  );
}
