import {
  validateBudgetPeriod,
  validateBudgetStatuses,
  validateSortField,
} from "@/modules/budgets/lib/validate-budget-params";
import type { BudgetQueryState } from "@/modules/budgets/types";
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

  const queryState: BudgetQueryState = {
    search: params.search?.trim() || undefined,
    statuses: validateBudgetStatuses(params.status) ?? [],
    // Tri-state: only filter when explicitly set, so the default shows all.
    isActive:
      params.isActive === "true"
        ? true
        : params.isActive === "false"
          ? false
          : undefined,
    period: validateBudgetPeriod(params.period),
    sortField:
      (validateSortField(params.sortField) as BudgetQueryState["sortField"]) ??
      "date",
    sortDir: params.sortDir === "asc" ? "asc" : "desc",
    limit: Math.min(Math.max(Number(params.limit) || 20, 1), 50),
  };

  const listInput = {
    limit: queryState.limit,
    search: queryState.search || undefined,
    status: queryState.statuses.length > 0 ? queryState.statuses : undefined,
    isActive: queryState.isActive,
    period: queryState.period,
    sortField: queryState.sortField,
    sortDir: queryState.sortDir,
  };

  prefetch(
    trpc.payments.budgets.list.infiniteQueryOptions(listInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  prefetch(trpc.payments.budgets.calendar.queryOptions({ month, year }));

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
        queryState={queryState}
        month={month}
        year={year}
        viewMode={viewMode}
        focusBudgetId={params.focusBudgetId}
        focusMode={params.mode}
      />
    </HydrateClient>
  );
};

export default Page;
