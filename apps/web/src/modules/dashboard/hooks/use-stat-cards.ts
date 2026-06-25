import { useAccountAggregates } from "@/modules/accounts/hooks/queries/use-account-aggregates";
import { useAccountsList } from "@/modules/accounts/hooks/queries/use-accounts";
import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useStatCards() {
  const trpc = useTRPC();

  const { totalBalance, totalCount } = useAccountAggregates();
  const { accountsData: allAccounts } = useAllAccounts({});
  const { data: monthSpending } = useSuspenseQuery(
    trpc.payments.transactions.currentMonthSpending.queryOptions(),
  );

  const savingsBalance = allAccounts
    .filter((a) => a.type === "savings")
    .reduce((sum, account) => sum + parseFloat(account.balance ?? "0"), 0);
  const savingsRate =
    totalBalance > 0 ? (savingsBalance / totalBalance) * 100 : 0;
  return {
    totalBalance,
    monthSpending,
    savingsRate,
    totalCount,
  };
}
