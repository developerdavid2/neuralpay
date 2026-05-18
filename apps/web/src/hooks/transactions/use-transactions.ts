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

export function useTopCategories(params?: {
  month?: number;
  year?: number;
  limit?: number;
}) {
  const trpc = useTRPC();
  const now = new Date();

  return useSuspenseQuery(
    trpc.payments.transactions.topCategories.queryOptions({
      month: params?.month ?? now.getMonth() + 1,
      year: params?.year ?? now.getFullYear(),
      limit: params?.limit ?? 5,
    }),
  );
}
