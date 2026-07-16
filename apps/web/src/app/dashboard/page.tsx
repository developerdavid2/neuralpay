import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

export default async function Page() {
  const now = new Date();

  // Fire all prefetches in parallel and await them together before rendering
  await Promise.all([
    prefetch(trpc.payments.accounts.aggregateByType.queryOptions()),
    prefetch(trpc.payments.accounts.list.queryOptions()),
    prefetch(trpc.payments.transactions.currentMonthSpending.queryOptions()),
    prefetch(
      trpc.payments.transactions.recent.queryOptions({
        limit: TRANSACTIONS_LIMIT,
      }),
    ),
    prefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "7d",
      }),
    ),
    prefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "30d",
      }),
    ),
    prefetch(
      trpc.payments.transactions.spendingOverview.queryOptions({
        period: "90d",
      }),
    ),
    prefetch(
      trpc.ai.insights.recent.queryOptions({
        limit: TRANSACTIONS_LIMIT,
      }),
    ),
    prefetch(
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
