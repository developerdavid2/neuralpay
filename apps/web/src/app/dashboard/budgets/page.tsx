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
    statsMonth?: string;
    statsYear?: string;
    calMonth?: string;
    calYear?: string;
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
  const nowMonth = now.getMonth() + 1;
  const nowYear = now.getFullYear();

  // Each surface owns an independent month/year scope so navigating one
  // never disturbs the others: stats -> statsMonth/statsYear,
  // calendar -> calMonth/calYear, list -> month/year.
  const clampMonth = (raw?: string, fallback = nowMonth) =>
    Math.min(Math.max(Number(raw) || fallback, 1), 12);
  const clampYear = (raw?: string, fallback = nowYear) =>
    Math.min(Math.max(Number(raw) || fallback, 2000), 2100);

  const viewMode = params.view === "list" ? "list" : "calendar";

  const statsMonth = clampMonth(params.statsMonth);
  const statsYear = clampYear(params.statsYear);
  const calMonth = clampMonth(params.calMonth);
  const calYear = clampYear(params.calYear);
  const listMonth = clampMonth(params.month);
  const listYear = clampYear(params.year);

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
    month: listMonth,
    year: listYear,
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
    month: queryState.month,
    year: queryState.year,
    sortField: queryState.sortField,
    sortDir: queryState.sortDir,
  };

  prefetch(
    trpc.payments.budgets.list.infiniteQueryOptions(listInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  prefetch(
    trpc.payments.budgets.calendar.queryOptions({
      month: calMonth,
      year: calYear,
    }),
  );

  prefetch(
    trpc.payments.budgets.monthlyStats.queryOptions({
      month: statsMonth,
      year: statsYear,
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
        statsMonth={statsMonth}
        statsYear={statsYear}
        calMonth={calMonth}
        calYear={calYear}
        viewMode={viewMode}
        focusBudgetId={params.focusBudgetId}
        focusMode={params.mode}
      />
    </HydrateClient>
  );
};

export default Page;
