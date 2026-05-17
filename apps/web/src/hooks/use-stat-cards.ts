import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

// hooks/dashboard/use-stat-cards.ts
export function useStatCards() {
  const trpc = useTRPC();

  const { data: balance } = useSuspenseQuery(
    trpc.payments.accounts.totalBalance.queryOptions(),
  );
  const { data: accounts } = useSuspenseQuery(
    trpc.payments.accounts.list.queryOptions(),
  );
  const { data: monthSpending } = useSuspenseQuery(
    trpc.payments.transactions.currentMonthSpending.queryOptions(),
  );

  const totalBalance = balance.totalBalance;
  const savingsBalance = accounts
    .filter((a) => a.type === "savings")
    .reduce((sum, account) => sum + parseFloat(account.balance ?? "0"), 0);
  const savingsRate =
    totalBalance > 0 ? (savingsBalance / totalBalance) * 100 : 0;
  const accountCount = balance.accountCount;

  return {
    balance,
    accounts,
    monthSpending,
    totalBalance,
    savingsRate,
    accountCount,
  };
}
