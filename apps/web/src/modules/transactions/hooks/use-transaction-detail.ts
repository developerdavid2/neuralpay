import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMemo } from "react";
import type { Transaction } from "@neuralpay/types";
import { useTransactionDrawer } from "../store/use-transaction-drawer";

export function useTransactionDetail(transactionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const drawerData = useTransactionDrawer((s) => s.transactionData);

  const fromListCache = useMemo(() => {
    if (!transactionId) return undefined;

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

    for (const [queryKey, data] of allQueries) {
      if (!data?.pages) continue;
      const found = data.pages
        .flatMap((page) => page.items)
        .find((tx) => tx.id === transactionId);
      if (found) {
        const dataUpdatedAt =
          queryClient.getQueryState(queryKey)?.dataUpdatedAt;
        return { transaction: found, dataUpdatedAt };
      }
    }

    return undefined;
  }, [transactionId, queryClient]);
  const seedData =
    drawerData?.id === transactionId
      ? { transaction: drawerData, dataUpdatedAt: undefined }
      : fromListCache;

  const {
    data: transaction,
    isPending,
    isError,
  } = useQuery({
    ...trpc.payments.transactions.getById.queryOptions({ transactionId }),
    enabled: !!transactionId,
    staleTime: 30_000,
    initialData: seedData?.transaction,
    initialDataUpdatedAt: seedData?.dataUpdatedAt,
  });

  return {
    transaction: transaction ?? null,
    isLoading: isPending && !seedData,
    isError,
  };
}
