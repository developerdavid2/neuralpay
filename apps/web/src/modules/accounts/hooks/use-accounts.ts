import { useTRPC } from "@/trpc/trpc-client";
import type { AccountsFilterInput } from "@neuralpay/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function useAccountsList(filters: AccountsFilterInput) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.payments.accounts.list.queryOptions(filters),
  );

  return {
    ...query,
    bankAccounts: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    pageCount: query.data?.pageCount ?? 1,
    isLoading: query.isPending,
  };
}
