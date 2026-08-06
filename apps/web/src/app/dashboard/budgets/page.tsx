import {
  validateBudgetPeriod,
  validateBudgetStatuses,
  validateSortField,
} from "@/modules/budgets/lib/validate-budget-params";
import { BudgetsView } from "@/modules/budgets/ui/views/budgets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

interface PageProps {
  searchParams: Promise<{
    view?: string;
    month?: string;
    year?: string;
    search?: string;
    status?: string | string[];
    isActive?: string;
    period?: string;
    sortField?: string;
    sortDir?: string;
    limit?: string;
    focusBudgetId?: string;
    mode?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const now = new Date();

  const viewMode = params.view === "list" ? "list" : "calendar";
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();
  const search = params.search?.trim() || "";
  const statuses = validateBudgetStatuses(params.status);
  const isActive = params.isActive === "false" ? false : true;
  const period = validateBudgetPeriod(params.period);
  const sortField: "date" | "spent" | "limitAmount" | "name" =
    validateSortField(params.sortField) || "date";
  const sortDir: "asc" | "desc" = params.sortDir === "asc" ? "asc" : "desc";
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);

  const listInput = {
    search: search || undefined,
    status: statuses,
    isActive,
    period,
    sortField,
    sortDir,
    limit,
  };

  prefetch(
    trpc.payments.budgets.list.infiniteQueryOptions(listInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  prefetch(
    trpc.payments.budgets.monthlyStats.queryOptions({
      month,
      year,
    }),
  );

  if (params.focusBudgetId) {
    prefetch(
      trpc.payments.budgets.getById.queryOptions({
        id: params.focusBudgetId,
      }),
    );
  }

  return (
    <HydrateClient>
      <BudgetsView
        viewMode={viewMode}
        month={month}
        year={year}
        search={search}
        statuses={statuses ?? []}
        isActive={isActive}
        period={period}
        sortField={sortField}
        sortDir={sortDir}
        limit={limit}
        focusBudgetId={params.focusBudgetId}
        focusMode={params.mode}
      />
    </HydrateClient>
  );
};

export default Page;
