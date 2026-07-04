import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

export default async function Page() {
  const now = new Date();

  void prefetch(trpc.payments.accounts.aggregateByType.queryOptions());
  void prefetch(trpc.payments.accounts.list.queryOptions());
  void prefetch(trpc.payments.transactions.currentMonthSpending.queryOptions());
  void prefetch(
    trpc.payments.transactions.recent.queryOptions({
      limit: TRANSACTIONS_LIMIT,
    }),
  );
  void prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "7d",
    }),
  );
  void prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "30d",
    }),
  );
  void prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "90d",
    }),
  );
  void prefetch(
    trpc.ai.insights.recent.queryOptions({
      limit: TRANSACTIONS_LIMIT,
    }),
  );
  void prefetch(
    trpc.payments.transactions.topCategories.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      limit: 10,
    }),
  );

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
}
