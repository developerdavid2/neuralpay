import { BudgetsView } from "@/modules/budgets/ui/views/budgets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";
import { endOfMonth, startOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

const Page = async () => {
  const now = new Date();

  // Prefetch summary + the current month's calendar data.
  prefetch(trpc.payments.budgets.summary.queryOptions());
  prefetch(
    trpc.payments.budgets.list.queryOptions({
      from: startOfMonth(now).toISOString(),
      to: endOfMonth(now).toISOString(),
      isActive: true,
    }),
  );

  return (
    <HydrateClient>
      <BudgetsView />
    </HydrateClient>
  );
};

export default Page;
