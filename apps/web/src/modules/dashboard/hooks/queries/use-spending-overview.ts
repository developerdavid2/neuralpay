import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSpendingOverview(params: {
  period: "7d" | "30d" | "90d" | "custom";
  from?: string;
  to?: string;
}) {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: params.period,
      from: params.from,
      to: params.to,
    }),
  );
}
