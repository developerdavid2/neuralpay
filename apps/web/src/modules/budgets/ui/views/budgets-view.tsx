import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import type { BudgetQueryState } from "../../types";
import { BudgetDrawerInit } from "../components/budget-drawer-init";
import { BudgetFormDrawer } from "../components/budget-form-drawer";
import {
  BudgetMonthlyStatsCards,
  BudgetMonthlyStatsSkeleton,
} from "../components/budget-monthly-stats-cards";
import { BudgetViewDrawer } from "../components/budget-view-drawer";
import {
  BudgetViewTabs,
  BudgetViewTabsSkeleton,
} from "../components/budget-view-tabs";
import { NewBudgetButton } from "../components/new-budget-button";

interface BudgetsViewProps {
  queryState: BudgetQueryState;
  statsMonth: number;
  statsYear: number;
  calMonth: number;
  calYear: number;
  viewMode: "calendar" | "list";
  focusBudgetId?: string;
  focusMode?: string;
}

export function BudgetsView({
  queryState,
  statsMonth,
  statsYear,
  calMonth,
  calYear,
  viewMode,
  focusBudgetId,
  focusMode,
}: BudgetsViewProps) {
  return (
    <div className="flex flex-col w-full gap-6 p-10 h-[125vh]">
      <DashboardHeader
        title="Budgets"
        description="Set spending limits by category and track them across your accounts."
        action={<NewBudgetButton />}
      />

      <SectionBoundary
        key={`${statsYear}-${statsMonth}`}
        fallback={<BudgetMonthlyStatsSkeleton />}
        errorMessage="Could not load budget summary"
      >
        <BudgetMonthlyStatsCards month={statsMonth} year={statsYear} />
      </SectionBoundary>

      <BudgetDrawerInit focusId={focusBudgetId} mode={focusMode} />

      <BudgetViewTabs
        queryState={queryState}
        calMonth={calMonth}
        calYear={calYear}
        viewMode={viewMode}
      />
    </div>
  );
}
