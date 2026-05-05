// hooks/use-dashboard.ts
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useDashboard() {
  const trpc = useTRPC();

  // All dashboard queries run in parallel (React Suspense handles coordination)
  const { data: balanceData } = useSuspenseQuery(
    trpc.payments.accounts.totalBalance.queryOptions(),
  );
  const { data: accounts } = useSuspenseQuery(
    trpc.payments.accounts.list.queryOptions(),
  );
  const { data: monthSpending } = useSuspenseQuery(
    trpc.payments.transactions.currentMonthSpending.queryOptions(),
  );
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.list.queryOptions({ limit: 7 }),
  );
  const now = new Date();
  const { data: spendingByCategory } = useSuspenseQuery(
    trpc.payments.transactions.spendingByCategory.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  );
  const { data: insights } = useSuspenseQuery(
    trpc.ai.insights.list.queryOptions({ limit: 3 }),
  );

  // Derived values for stat cards
  const totalBalance = balanceData.totalBalance;
  const accountCount = balanceData.accountCount;
  const savingsAccount = accounts.find((a) => a.type === "savings");
  const savingsBalance = parseFloat(savingsAccount?.balance ?? "0");
  const savingsRate =
    totalBalance > 0 ? (savingsBalance / totalBalance) * 100 : 0;

  return {
    // Raw data
    balanceData,
    accounts,
    monthSpending,
    recentTransactions,
    spendingByCategory,
    insights,
    // Derived values
    totalBalance,
    accountCount,
    savingsRate,
  };
}
