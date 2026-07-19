// app/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, safePrefetch, trpc } from "@/trpc/trpc-server";
import { getServerSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function Page() {
  // ✅ Check session first — if null, redirect
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }

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
      trpc.ai.insights.recent.queryOptions({ limit: TRANSACTIONS_LIMIT }),
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
