import { useTRPC } from "@/trpc/trpc-client";
import type { AccountsListAllInput } from "@neuralpay/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useAllAccounts(filter?: AccountsListAllInput) {
  const trpc = useTRPC();

  const { data: accountsData, isPending } = useSuspenseQuery(
    trpc.payments.accounts.listAll.queryOptions(filter),
  );

  const bankAccountOptions = (accountsData ?? []).map((acc) => ({
    label: `${acc.bankName ?? "Unknown"} • ${acc.name}`,
    value: acc.id,
    disabled: acc.status === "inactive",
  }));

  return {
    accountsData,
    bankAccountOptions,
    isLoadingAccounts: isPending,
  };
}
