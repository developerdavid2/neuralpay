import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, safePrefetch, trpc } from "@/trpc/trpc-server";

export default async function Page() {
  const now = new Date();

  await Promise.all([
    safePrefetch(trpc.payments.accounts.aggregateByType.queryOptions()),
    safePrefetch(trpc.payments.accounts.list.queryOptions()),
    safePrefetch(
      trpc.payments.transactions.currentMonthSpending.queryOptions(),
    ),
    safePrefetch(
      trpc.payments.transactions.recent.queryOptions({
        limit: TRANSACTIONS_LIMIT,
      }),
    ),
    safePrefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "7d",
      }),
    ),
    safePrefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "30d",
      }),
    ),
    safePrefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "90d",
      }),
    ),
    safePrefetch(
      trpc.ai.insights.recent.queryOptions({
        limit: TRANSACTIONS_LIMIT,
      }),
    ),
    safePrefetch(
      trpc.payments.transactions.topCategories.queryOptions({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        limit: 10,
      }),
    ),
  ]);

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
}
