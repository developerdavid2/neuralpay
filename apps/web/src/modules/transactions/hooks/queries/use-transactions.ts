import { useTRPC } from "@/trpc/trpc-client";
import type { Transaction, TransactionsFilterInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
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
