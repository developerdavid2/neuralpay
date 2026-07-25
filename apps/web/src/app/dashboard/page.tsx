import {
  INSIGHTS_LIMIT,
  TRANSACTIONS_LIMIT,
} from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const now = new Date();

  prefetch(trpc.payments.accounts.aggregateByType.queryOptions());
  prefetch(trpc.payments.accounts.list.queryOptions());
  prefetch(trpc.payments.transactions.currentMonthSpending.queryOptions());
  prefetch(
    trpc.payments.transactions.recent.queryOptions({
      limit: TRANSACTIONS_LIMIT,
    }),
  );
  prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "7d",
    }),
  );
  prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "30d",
    }),
  );
  prefetch(
    trpc.payments.transactions.spendingOverview.queryOptions({
      period: "90d",
    }),
  );
  prefetch(
    trpc.payments.transactions.topCategories.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      limit: 10,
    }),
  );

  prefetch(trpc.ai.insights.recent.queryOptions({ limit: INSIGHTS_LIMIT }));
  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
}
