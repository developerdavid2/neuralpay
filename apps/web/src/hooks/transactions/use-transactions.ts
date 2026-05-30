import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";

import { useTRPC } from "@/trpc/trpc-client";
import type { Transaction, TransactionsFilterInput } from "@neuralpay/types";
import {
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";

function groupTransactionsByMonth(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const monthKey = format(new Date(tx.date), "yyyy-MM");
    if (!grouped.has(monthKey)) grouped.set(monthKey, []);
    grouped.get(monthKey)!.push(tx);
  }
  return grouped;
}

export function useTransactionsList(filters: TransactionsFilterInput) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.payments.transactions.list.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 30_000,
    }),
  );

  const allTransactions = useMemo(() => {
    const txs = query.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return txs.filter((tx) => {
      if (seen.has(tx.id)) return false;
      seen.add(tx.id);
      return true;
    });
  }, [query.data?.pages]);

  const { grouped, sortedMonths } = useMemo(() => {
    const grouped = groupTransactionsByMonth(allTransactions);
    const sortedMonths = Array.from(grouped.keys()).sort().reverse();
    return { grouped, sortedMonths };
  }, [allTransactions]);

  return {
    ...query,
    allTransactions,
    grouped,
    sortedMonths,
    isLoading: query.isPending,
  };
}

// TRANSACTIONS (for dashboard)
//RECENT
export function useRecentTransactions(limit = TRANSACTIONS_LIMIT) {
  const trpc = useTRPC();
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.recent.queryOptions({ limit }),
  );

  return { recentTransactions };
}
//SPENDING OVERVIEW
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

//TOP MONTHLY CATEGORIES
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

// TRANSACTION DETAILS BY ID
export function useTransactionDetail(transactionId: string) {
  const trpc = useTRPC();
  const {
    data: transaction,
    isPending,
    isError,
  } = useQuery({
    ...trpc.payments.transactions.getById.queryOptions({ id: transactionId }),
    enabled: !!transactionId,
    staleTime: 30_000,
  });

  return {
    transaction: transaction ?? null,
    isLoading: isPending,
    isError,
  };
}

//AI INSIGHT
// export function useTransactionInsight(transactionId: string | null) {
//   const trpc = useTRPC();
//   const {
//     data: insight,
//     isPending,
//     isError,
//   } = useQuery({
//     ...trpc.ai.insights.getInsightById.queryOptions(
//       { transactionId: transactionId! },
//       { enabled: !!transactionId },
//     ),
//     enabled: !!transactionId,
//   });

//   return {
//     insight: insight ?? null,
//     isLoading: isPending,
//     isError,
//   };
// }
