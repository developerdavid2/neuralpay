import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import {
  getQueryClient,
  HydrateClient,
  prefetch,
  trpc,
} from "@/trpc/trpc-server";

export default async function Page() {
  await Promise.allSettled([
    prefetch(trpc.payments.accounts.totalBalance.queryOptions()),
    prefetch(trpc.payments.accounts.list.queryOptions()),
    prefetch(trpc.payments.transactions.currentMonthSpending.queryOptions()),
    prefetch(
      trpc.payments.transactions.list.queryOptions({
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
      trpc.ai.insights.list.queryOptions({
        limit: 3,
      }),
    ),
  ]);

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
}
