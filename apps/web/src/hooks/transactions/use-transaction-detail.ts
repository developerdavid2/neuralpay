import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactionDrawer } from "./use-transaction-drawer";
import { useMemo } from "react";
import type { Transaction } from "@neuralpay/types";

export function useTransactionDetail(transactionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const drawerData = useTransactionDrawer((s) => s.transactionData);

  const fromListCache = useMemo(() => {
    if (!transactionId) return undefined;

    // Find any cached list query regardless of what filters were active
    const allQueries = queryClient.getQueriesData<{
      pages: Array<{ items: Transaction[] }>;
    }>({
      predicate: (query) => {
        const key = query.queryKey as unknown[];
        if (!Array.isArray(key[0])) return false;
        const segments = key[0] as string[];
        return (
          segments[0] === "payments" &&
          segments[1] === "transactions" &&
          segments[2] === "list"
        );
      },
    });

    for (const [, data] of allQueries) {
      if (!data?.pages) continue;
      const found = data.pages
        .flatMap((page) => page.items)
        .find((tx) => tx.id === transactionId);
      if (found) return found;
    }

    return undefined;
  }, [transactionId, queryClient]);

  // Drawer store takes priority (came directly from the clicked row)
  // List cache is the fallback (handles cases where drawer store is stale/empty)
  const seedData =
    drawerData?.id === transactionId ? drawerData : fromListCache;

  const {
    data: transaction,
    isPending,
    isError,
  } = useQuery({
    ...trpc.payments.transactions.getById.queryOptions({ id: transactionId }),
    enabled: !!transactionId,
    staleTime: 30_000,
    initialData: seedData,
    // Only mark as stale immediately if we seeded from cache, not from fresh click
    // This prevents a redundant background refetch when the user just clicked a row
    initialDataUpdatedAt: seedData
      ? queryClient.getQueryState(
          trpc.payments.transactions.list.infiniteQueryKey({} as never),
        )?.dataUpdatedAt
      : undefined,
  });

  return {
    transaction: transaction ?? null,
    // Don't flash a skeleton if we already have seed data to show
    isLoading: isPending && !seedData,
    isError,
  };
}
