import type {
	BudgetHealth,
	BudgetPeriod,
	BudgetSortDir,
	BudgetSortField,
	CreateBudgetInput,
} from "@neuralpay/types";

export type BudgetFormValues = {
	name: string;
	description?: string;
	categories: CreateBudgetInput["categories"];
	limitAmount: number;
	color?: string;
	period: "weekly" | "monthly" | "custom";
	startDate: string;
	endDate: string;
	alertThreshold: number;
	accountIds: string[];
};

export interface BudgetQueryState {
	search?: string;
	statuses: BudgetHealth[];
	// Tri-state: undefined = all budgets, true = active only, false = inactive only.
	isActive?: boolean;
	period?: BudgetPeriod;
	sortField: BudgetSortField;
	sortDir: BudgetSortDir;
	limit: number;
}
