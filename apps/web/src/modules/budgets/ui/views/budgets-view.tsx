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
import { BudgetViewTabs } from "../components/budget-view-tabs";
import { NewBudgetButton } from "../components/new-budget-button";

interface BudgetsViewProps {
	queryState: BudgetQueryState;
	month: number;
	year: number;
	viewMode: "calendar" | "list";
	focusBudgetId?: string;
	focusMode?: string;
}

export function BudgetsView({
	queryState,
	month,
	year,
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
				fallback={<BudgetMonthlyStatsSkeleton />}
				errorMessage="Could not load budget summary"
			>
				<BudgetMonthlyStatsCards month={month} year={year} />
			</SectionBoundary>

			<BudgetDrawerInit focusId={focusBudgetId} mode={focusMode} />

			<SectionBoundary
				fallback={<p>Loading...</p>}
				errorMessage="Could not load budget"
			>
				<BudgetViewTabs
					queryState={queryState}
					month={month}
					year={year}
					viewMode={viewMode}
				/>
			</SectionBoundary>
			<BudgetFormDrawer />
			<BudgetViewDrawer />
		</div>
	);
}
