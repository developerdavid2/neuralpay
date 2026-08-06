import { z } from "zod";
import { TRANSACTION_CATEGORY, type TransactionCategory } from "./transactions";
import type { PaginatedResult } from "./pagination";

export const BUDGET_CATEGORY = TRANSACTION_CATEGORY;
export type BudgetCategory = TransactionCategory;

export const BUDGET_HEALTH = ["on_track", "warning", "over"] as const;
export type BudgetHealth = (typeof BUDGET_HEALTH)[number];

export const BUDGET_PERIODS = ["weekly", "monthly", "custom"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export const BUDGET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
] as const;

export const budgetCategorySchema = z.object({
  category: z.enum(BUDGET_CATEGORY),
  limitAmount: z.number().positive(),
});

export type BudgetCategoryAllocation = z.infer<typeof budgetCategorySchema>;

export const createBudgetSchema = z
  .object({
    name: z.string().min(2).max(120),
    description: z.string().max(500).optional(),
    color: z.enum(BUDGET_COLORS).default("#6366f1"),
    period: z.enum(BUDGET_PERIODS).default("monthly"),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
    alertThreshold: z.number().int().min(1).max(100).default(80),
    categories: z.array(budgetCategorySchema).min(1).max(10),
    limitAmount: z.number().positive(),
    accountIds: z.array(z.uuid()).max(50).default([]),
  })
  .refine(
    (data) => {
      const categoryTotal = data.categories.reduce(
        (sum, c) => sum + c.limitAmount,
        0,
      );
      return Math.abs(categoryTotal - data.limitAmount) < 0.01;
    },
    {
      message: "Category allocations must sum to the total budget limit",
      path: ["categories"],
    },
  )
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const updateBudgetSchema = z
  .object({
    id: z.uuid(),
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional().nullable(),
    color: z.enum(BUDGET_COLORS).optional().nullable(),
    period: z.enum(BUDGET_PERIODS).optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    alertThreshold: z.number().int().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
    categories: z.array(budgetCategorySchema).optional(),
    limitAmount: z.number().positive().optional(),
    accountIds: z.array(z.uuid()).optional(),
  })
  .refine(
    (data) => {
      if (!data.categories || data.limitAmount === undefined) return true;
      const categoryTotal = data.categories.reduce(
        (sum, c) => sum + c.limitAmount,
        0,
      );
      return Math.abs(categoryTotal - data.limitAmount) < 0.01;
    },
    {
      message: "Category allocations must sum to the total budget limit",
      path: ["categories"],
    },
  )
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

// Filter & Sort schemas
export const budgetStatusSchema = z.enum(BUDGET_HEALTH).optional();

export const budgetsListInputSchema = z.object({
  // Filter fields flattened to top level
  search: z.string().min(1).max(100).optional(),
  status: z.union([budgetStatusSchema, z.array(budgetStatusSchema)]).optional(),
  isActive: z.boolean().optional(),
  period: z.enum(BUDGET_PERIODS).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  // Sort
  sortField: z.enum(["date", "spent", "limitAmount", "name"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  // Pagination — top level, not nested
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const budgetSortSchema = z.object({
  field: z.enum(["date", "spent", "limitAmount", "name"]).default("date"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export type BudgetsListInput = z.infer<typeof budgetsListInputSchema>;
export type BudgetSortInput = z.infer<typeof budgetSortSchema>;
export type CreateBudgetInput = z.input<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.input<typeof updateBudgetSchema>;

export type BudgetAccountRef = {
  bankAccountId: string;
  name: string | null;
  bankName: string | null;
  isActive: boolean;
};

export type BudgetCategoryDetail = {
  category: BudgetCategory;
  limitAmount: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  transactionCount: number;
};

export type Budget = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  limitAmount: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  isActive: boolean;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
  categories: BudgetCategoryDetail[];
  accounts: BudgetAccountRef[];
  totalSpent: number;
  totalRemaining: number;
  totalPercentUsed: number;
  status: BudgetHealth;
  daysRemaining: number;
  transactionCount: number;
};

export type BudgetMonthlyStats = {
  currentMonth: string;
  totalBudgeted: number;
  totalSpent: number;
  savingsRate: number;
  needsAttention: {
    count: number;
    onTrackCount: number;
    overBudgetCount: number;
  };
};

export type BudgetSummary = BudgetMonthlyStats;

export type BudgetCalendarDay = {
  date: string;
  budgets: Array<{
    id: string;
    name: string;
    color: string | null;
    status: BudgetHealth;
    spent: number;
    limitAmount: string;
  }>;
};

export type PaginatedBudgets = PaginatedResult<Budget>;
