import { z } from "zod";
import { tool, type Tool } from "ai";

// ============================================================================
// Shared input primitives
// ============================================================================

const UUID_RE =
  /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

const uuidInput = () =>
  z.string().refine((v) => UUID_RE.test(v), "Expected a valid UUID");

const datetimeInput = () =>
  z
    .string()
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && /\d/.test(v),
      "Expected a valid ISO datetime",
    );

const CATEGORIES = [
  "food_dining",
  "utilities",
  "rent",
  "transport",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "transfer",
  "income",
  "investment",
  "subscriptions",
  "groceries",
  "other",
] as const;

const STATUSES = ["on_track", "warning", "over"] as const;

const ACCOUNT_TYPES = ["checking", "savings", "credit", "investment"] as const;

const BUDGET_PERIODS = ["weekly", "monthly", "custom"] as const;

const CHART_TYPES = ["pie", "bar", "area"] as const;

const CHART_PERIODS = ["7d", "30d", "90d"] as const;

const ANALYSIS_PERIODS = [
  "7d",
  "30d",
  "90d",
  "this_month",
  "last_month",
  "custom",
] as const;

const GROUP_BY = ["category", "day", "week"] as const;

const ORDER_BY = [
  "date_desc",
  "date_asc",
  "amount_desc",
  "amount_asc",
] as const;

const TX_STATUSES = [
  "pending",
  "successful",
  "refunded",
  "reversed",
  "failed",
] as const;

const TIMEFRAMES = ["this_week", "this_month"] as const;

// ============================================================================
// Input schemas — Read-only tools
// ============================================================================

export const queryTransactionsInput = z.object({
  query: z.string().max(200).optional(),
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(["debit", "credit"]).optional(),
  status: z.enum(TX_STATUSES).optional(),
  accountId: uuidInput().optional(),
  dateFrom: datetimeInput().optional(),
  dateTo: datetimeInput().optional(),
  onlyAnomalies: z.boolean().optional().default(false),
  orderBy: z.enum(ORDER_BY).optional().default("date_desc"),
  limit: z.number().int().min(1).max(50).default(15),
  includeNotes: z.boolean().optional().default(false),
});

export const getSpendingAnalysisInput = z.object({
  period: z.enum(ANALYSIS_PERIODS).default("30d"),
  dateFrom: datetimeInput().optional().describe("Required when period=custom"),
  dateTo: datetimeInput().optional().describe("Required when period=custom"),
  groupBy: z.enum(GROUP_BY).default("category"),
  comparePrevious: z.boolean().default(true),
  limit: z.number().int().min(1).max(20).default(10),
  category: z.enum(CATEGORIES).optional(),
});

export const renderSpendingChartInput = z.object({
  chartType: z.enum(CHART_TYPES),
  period: z.enum(CHART_PERIODS).default("30d"),
  title: z.string(),
});

export const queryBudgetsInput = z.object({
  budgetId: uuidInput().optional(),
  status: z.enum(STATUSES).optional(),
  onlyActive: z.boolean().default(true),
  includeCategories: z.boolean().default(false),
  includeLinkedAccounts: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getUnbudgetedSpendingInput = z.object({});

export const getAccountsInput = z.object({
  accountId: uuidInput().optional(),
  includeMonthlySpend: z.boolean().default(false),
  onlyActive: z.boolean().default(true),
});

// ============================================================================
// Input schemas — Write tools (propose-*)
// ============================================================================

export const proposeBudgetCreateInput = z.object({
  name: z.string(),
  period: z.enum(BUDGET_PERIODS).default("monthly"),
  categories: z.array(
    z.object({
      category: z.string(),
      limitAmount: z.number().positive(),
    }),
  ),
  alertThreshold: z.number().int().min(1).max(100).default(80),
  reasoning: z.string(),
});

export const proposeBudgetEditInput = z.object({
  budgetId: z.string(),
  changes: z.object({
    name: z.string().optional(),
    categories: z
      .array(
        z.object({
          category: z.string(),
          limitAmount: z.number().positive(),
        }),
      )
      .optional(),
    alertThreshold: z.number().int().min(1).max(100).optional(),
  }),
  reasoning: z.string(),
});

export const proposeBudgetDeleteInput = z.object({
  budgetId: z.string(),
  reasoning: z.string(),
});

export const proposeBudgetRebalanceInput = z.object({
  steps: z
    .array(
      z.object({
        budgetId: z.string(),
        changeAmount: z.number(),
        reason: z.string(),
      }),
    )
    .min(2)
    .max(5),
  overallReasoning: z.string(),
});

export const proposeSpendingGoalInput = z.object({
  targetAmount: z.number().positive(),
  timeframe: z.enum(TIMEFRAMES),
  reasoning: z.string(),
});

export const proposeAccountCreateInput = z.object({
  name: z.string(),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.number().default(0),
  bankName: z.string().optional(),
  reasoning: z.string(),
});

export const proposeRecategorizeInput = z.object({
  transactionIds: z.array(z.string()).min(1).max(50),
  targetCategory: z.string(),
  reasoning: z.string(),
});

export const proposeInsightDismissInput = z.object({
  insightId: z.string(),
  reasoning: z.string(),
});

// ============================================================================
// Tool input types
// ============================================================================

export type QueryTransactionsInput = z.infer<typeof queryTransactionsInput>;
export type GetSpendingAnalysisInput = z.infer<typeof getSpendingAnalysisInput>;
export type RenderSpendingChartInput = z.infer<typeof renderSpendingChartInput>;
export type QueryBudgetsInput = z.infer<typeof queryBudgetsInput>;
export type GetUnbudgetedSpendingInput = z.infer<
  typeof getUnbudgetedSpendingInput
>;
export type GetAccountsInput = z.infer<typeof getAccountsInput>;

export type ProposeBudgetCreateInput = z.infer<typeof proposeBudgetCreateInput>;
export type ProposeBudgetEditInput = z.infer<typeof proposeBudgetEditInput>;
export type ProposeBudgetDeleteInput = z.infer<typeof proposeBudgetDeleteInput>;
export type ProposeBudgetRebalanceInput = z.infer<
  typeof proposeBudgetRebalanceInput
>;
export type ProposeSpendingGoalInput = z.infer<typeof proposeSpendingGoalInput>;
export type ProposeAccountCreateInput = z.infer<
  typeof proposeAccountCreateInput
>;
export type ProposeRecategorizeInput = z.infer<typeof proposeRecategorizeInput>;
export type ProposeInsightDismissInput = z.infer<
  typeof proposeInsightDismissInput
>;

// ============================================================================
// Tool contracts (schema + description only, no execute)
// ============================================================================

export const readOnlyToolContracts: Record<string, Tool> = {
  queryTransactions: tool({
    description:
      "Search, list, and filter transactions by merchant/description text, category, type, status, bank account, or date range; optionally surface only anomalies or include notes.",
    inputSchema: queryTransactionsInput,
  }),

  getSpendingAnalysis: tool({
    description:
      "Compute spending analytics for a period — totals, per-category breakdown, or a day/week trend — with optional comparison to the previous period.",
    inputSchema: getSpendingAnalysisInput,
  }),

  renderSpendingChart: tool({
    description:
      "Render an interactive chart of the user's spending — by category (pie/bar) or over time (area).",
    inputSchema: renderSpendingChartInput,
  }),

  queryBudgets: tool({
    description:
      "List budgets with computed health (on_track/warning/over), percent used, and days remaining; optionally include per-category breakdown and linked accounts.",
    inputSchema: queryBudgetsInput,
  }),

  getUnbudgetedSpending: tool({
    description:
      "Find spending categories the user spent money on this month that no active budget covers.",
    inputSchema: getUnbudgetedSpendingInput,
  }),

  getAccounts: tool({
    description:
      "List the user's bank accounts with balance, type, institution, and optional current-month spend.",
    inputSchema: getAccountsInput,
  }),
};

export const actToolContracts: Record<string, Tool> = {
  ...readOnlyToolContracts,

  proposeBudgetCreate: tool({
    description:
      "Draft a new budget proposal for user confirmation (never creates directly). Use when the user wants a budget they don't have.",
    inputSchema: proposeBudgetCreateInput,
  }),

  proposeBudgetEdit: tool({
    description:
      "Draft changes to an existing budget for user confirmation (never edits directly). Use when suggesting a user raise/lower a limit, add/remove a category, or change the alert threshold.",
    inputSchema: proposeBudgetEditInput,
  }),

  proposeBudgetDelete: tool({
    description:
      "Draft a proposal to delete a budget for user confirmation (never deletes directly). Use when the user asks to remove a budget or when suggesting cleanup of a stale one.",
    inputSchema: proposeBudgetDeleteInput,
  }),

  proposeBudgetRebalance: tool({
    description:
      "Draft a multi-step plan to shift budget allocation between two or more budgets. Never applies changes directly.",
    inputSchema: proposeBudgetRebalanceInput,
  }),

  proposeSpendingGoal: tool({
    description:
      "Draft a simple spending goal (not a full budget) for user confirmation — e.g. 'keep total spend under $X this month'. Never saves directly.",
    inputSchema: proposeSpendingGoalInput,
  }),

  proposeAccountCreate: tool({
    description:
      "Draft a new manual account for user confirmation. Never creates directly. Use when the user wants to track an account not synced via Plaid.",
    inputSchema: proposeAccountCreateInput,
  }),

  proposeRecategorize: tool({
    description:
      "Draft a proposal to recategorize one or more transactions. Never updates directly. Use when a transaction looks miscategorized or the user wants to bulk-fix a category.",
    inputSchema: proposeRecategorizeInput,
  }),

  proposeInsightDismiss: tool({
    description:
      "Draft a proposal to dismiss an insight the user has already seen and doesn't find useful. Never dismisses directly.",
    inputSchema: proposeInsightDismissInput,
  }),
};

// ============================================================================
// Tool mode & filtering
// ============================================================================

export type ToolMode = "plan" | "act";

export function getToolContracts(mode: ToolMode) {
  return mode === "plan" ? readOnlyToolContracts : actToolContracts;
}

// ============================================================================
// Re-export all schemas under a namespace for convenience
// ============================================================================

export const toolInputSchemas = {
  queryTransactions: queryTransactionsInput,
  getSpendingAnalysis: getSpendingAnalysisInput,
  renderSpendingChart: renderSpendingChartInput,
  queryBudgets: queryBudgetsInput,
  getUnbudgetedSpending: getUnbudgetedSpendingInput,
  getAccounts: getAccountsInput,
  proposeBudgetCreate: proposeBudgetCreateInput,
  proposeBudgetEdit: proposeBudgetEditInput,
  proposeBudgetDelete: proposeBudgetDeleteInput,
  proposeBudgetRebalance: proposeBudgetRebalanceInput,
  proposeSpendingGoal: proposeSpendingGoalInput,
  proposeAccountCreate: proposeAccountCreateInput,
  proposeRecategorize: proposeRecategorizeInput,
  proposeInsightDismiss: proposeInsightDismissInput,
} as const;

export type ToolName = keyof typeof toolInputSchemas;
