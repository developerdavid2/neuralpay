import type {
  BudgetHealth,
  BudgetPeriod,
  BudgetSortDir,
  BudgetSortField,
  CreateBudgetInput,
  UpdateBudgetFormInput,
} from "@orra/types";

export type CreateFormValues = CreateBudgetInput;
export type UpdateFormValues = UpdateBudgetFormInput;
export type FormValues = CreateFormValues | UpdateFormValues;

export interface BudgetQueryState {
  search?: string;
  statuses: BudgetHealth[];
  isActive?: boolean;
  period?: BudgetPeriod;
  month?: number;
  year?: number;
  sortField: BudgetSortField;
  sortDir: BudgetSortDir;
  limit: number;
}
