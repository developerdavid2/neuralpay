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
	isActive: boolean;
	period?: BudgetPeriod;
	sortField: BudgetSortField;
	sortDir: BudgetSortDir;
	limit: number;
}
