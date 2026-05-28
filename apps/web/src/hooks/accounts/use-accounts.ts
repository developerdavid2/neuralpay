import { useTRPC } from "@/trpc/trpc-client";
import type { AccountsFilterInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useAccountsList(filters: AccountsFilterInput) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.payments.accounts.list.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  const allAccounts = useMemo(() => {
    const accounts = query.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return accounts.filter((tx) => {
      if (seen.has(tx.id)) return false;
      seen.add(tx.id);
      return true;
    });
  }, [query.data?.pages]);

  return {
    ...query,
    bankAccounts: allAccounts,
    isLoading: query.isPending,
  };
}
