// hooks/accounts/use-all-accounts.ts
import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useAllAccounts() {
  const trpc = useTRPC();

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    ...trpc.payments.accounts.listAll.queryOptions(),
    staleTime: 60_000,
  });

  const bankAccountOptions = (accountsData ?? []).map((acc) => ({
    label: `${acc.bankName ?? "Unknown"} • ${acc.name}`,
    value: acc.id,
  }));

  return {
    bankAccountOptions,
    isLoadingAccounts,
  };
}
