import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { prefetch, trpc, HydrateClient } from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

const Page = async () => {
  const now = new Date();

  await prefetch(trpc.payments.accounts.totalBalance.queryOptions());
  await prefetch(trpc.payments.accounts.list.queryOptions());
  await prefetch(
    trpc.payments.transactions.currentMonthSpending.queryOptions(),
  );
  await prefetch(trpc.payments.transactions.list.queryOptions({ limit: 7 }));
  await prefetch(
    trpc.payments.transactions.spendingByCategory.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  );
  prefetch(trpc.ai.insights.list.queryOptions({ limit: 3 }));

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
};

export default Page;
