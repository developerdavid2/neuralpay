import { z } from "zod";
import { TRANSACTION_CATEGORY, type TransactionCategory } from "./transactions";

// Reuse the shared category vocabulary so budgets align 1:1 with transactions.
export const BUDGET_CATEGORY = TRANSACTION_CATEGORY;
export type BudgetCategory = TransactionCategory;

export const BUDGET_PERIODS = ["weekly", "monthly", "custom"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

// Tailwind-friendly hex swatches offered in the create/edit modal.
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

export const createBudgetSchema = z
  .object({
    name: z
      .string({ error: "Budget name is required" })
      .min(2, { error: "Budget name must be at least 2 characters" })
      .max(120, { error: "Budget name is too long" }),
    description: z.string().max(500, { error: "Description is too long" }).optional(),
    category: z.enum(BUDGET_CATEGORY, {
      error: (issue) =>
        issue.code === "invalid_value"
          ? "Please select a valid category"
          : "Category is required",
    }),
    limitAmount: z
      .number({ error: "Limit must be a valid number" })
      .positive({ error: "Limit must be greater than 0" }),
    color: z.string().max(20).optional(),
    period: z.enum(BUDGET_PERIODS).default("monthly"),
    startDate: z.string().datetime({ error: "Invalid start date" }),
    endDate: z.string().datetime({ error: "Invalid end date" }),
    alertThreshold: z
      .number()
      .int()
      .min(1, { error: "Threshold must be between 1 and 100" })
      .max(100, { error: "Threshold must be between 1 and 100" })
      .default(80),
    accountIds: z.array(z.uuid()).max(50).default([]),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
    error: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const updateBudgetSchema = z
  .object({
    id: z.uuid(),
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional().nullable(),
    category: z.enum(BUDGET_CATEGORY).optional(),
    limitAmount: z.number().positive().optional(),
    color: z.string().max(20).optional().nullable(),
    period: z.enum(BUDGET_PERIODS).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    alertThreshold: z.number().int().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
    accountIds: z.array(z.uuid()).max(50).optional(),
  })
  .refine(
    (v) =>
      !v.startDate ||
      !v.endDate ||
      new Date(v.endDate) >= new Date(v.startDate),
    { error: "End date must be on or after the start date", path: ["endDate"] },
  );

export const budgetsFilterSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  category: z
    .union([z.enum(BUDGET_CATEGORY), z.array(z.enum(BUDGET_CATEGORY))])
    .optional(),
  isActive: z.boolean().optional(),
  // Overlap window — return budgets whose range intersects [from, to]
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type BudgetsFilterInput = z.infer<typeof budgetsFilterSchema>;
export type CreateBudgetInput = z.input<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.input<typeof updateBudgetSchema>;

export type BudgetAccountRef = {
  bankAccountId: string;
  name: string | null;
  bankName: string | null;
};

// Row + derived spend metrics returned to the client.
export type Budget = {
  id: string;
  userId: string;
  name: string | null;
  description: string | null;
  category: BudgetCategory;
  color: string | null;
  limitAmount: string;
  month: number;
  year: number;
  alertThreshold: number | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  accounts: BudgetAccountRef[];
  // ── Derived (computed server-side, not stored)
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetHealth;
  daysRemaining: number;
  transactionCount: number;
};

export const BUDGET_HEALTH = ["on_track", "warning", "over"] as const;
export type BudgetHealth = (typeof BUDGET_HEALTH)[number];

export type BudgetSummary = {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  activeCount: number;
  overCount: number;
  warningCount: number;
};
