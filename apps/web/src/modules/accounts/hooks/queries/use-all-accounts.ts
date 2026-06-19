// hooks/accounts/use-all-accounts.ts
import { useTRPC } from "@/trpc/trpc-client";
import type { AccountsListAllInput } from "@neuralpay/types";
import { useQuery } from "@tanstack/react-query";

export function useAllAccounts(filter?: AccountsListAllInput) {
  const trpc = useTRPC();

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    ...trpc.payments.accounts.listAll.queryOptions(filter),
    staleTime: 60_000,
  });

  const bankAccountOptions = (accountsData ?? []).map((acc) => ({
    label: `${acc.bankName ?? "Unknown"} • ${acc.name}`,
    value: acc.id,
  }));

  return {
    accountsData,
    bankAccountOptions,
    isLoadingAccounts,
  };
}
