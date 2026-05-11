import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/trpc-server";
export default async function Page() {
  const queryClient = getQueryClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = now.getFullYear();

  await Promise.allSettled([
    queryClient.prefetchQuery(
      trpc.payments.accounts.totalBalance.queryOptions(),
    ),
    queryClient.prefetchQuery(trpc.payments.accounts.list.queryOptions()),
    queryClient.prefetchQuery(
      trpc.payments.transactions.currentMonthSpending.queryOptions(),
    ),
    queryClient.prefetchQuery(
      trpc.payments.transactions.list.queryOptions({
        limit: 7,
      }),
    ),
    queryClient.prefetchQuery(
      trpc.payments.transactions.spendingByCategory.queryOptions({
        month: currentMonth,
        year: currentYear,
      }),
    ),
    queryClient.prefetchQuery(
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
