// apps/web/src/modules/budgets/lib/budget-params.ts

import {
  BUDGET_HEALTH,
  BUDGET_PERIODS,
  type BudgetHealth,
  type BudgetPeriod,
} from "@orra/types";

const VALID_STATUSES = BUDGET_HEALTH;
const VALID_PERIODS = BUDGET_PERIODS;
const VALID_SORT_FIELDS = ["date", "spent", "limitAmount", "name"] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];

export function validateBudgetStatuses(
  raw?: string | string[],
): BudgetHealth[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  if (arr.length === 0 || arr[0] === "all") return undefined;
  const valid = arr.filter((s): s is BudgetHealth =>
    VALID_STATUSES.includes(s as BudgetHealth),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateBudgetPeriod(raw?: string): BudgetPeriod | undefined {
  if (!raw || raw === "all") return undefined;
  return VALID_PERIODS.includes(raw as BudgetPeriod)
    ? (raw as BudgetPeriod)
    : undefined;
}

export function validateSortField(raw?: string): SortField | undefined {
  if (!raw) return undefined;
  return VALID_SORT_FIELDS.includes(raw as SortField)
    ? (raw as SortField)
    : undefined;
}
