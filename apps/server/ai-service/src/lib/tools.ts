import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgetCategories,
  budgets,
  transactions,
} from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { buildSpendingChartTool } from "./ai-tools/spending-chart.tool";

export function buildTools(userId: string) {
  return {
    getAccountBalances: tool({
      description:
        "Get the user's bank account balances, types, and names and the institution names. Use this whenever the user asks about balances or accounts not already covered by the current context.",
      inputSchema: z.object({}),
      execute: async () => {
        const accounts = await db
          .select({
            name: bankAccounts.name,
            bankName: bankAccounts.bankName,
            type: bankAccounts.type,
            balance: bankAccounts.balance,
            isManual: bankAccounts.isManual,
          })
          .from(bankAccounts)
          .where(
            and(
              eq(bankAccounts.userId, userId),
              eq(bankAccounts.status, "active"),
            ),
          );
        return accounts;
      },
    }),

    getBudgetById: tool({
      description:
        "Get full detail on a specific budget by id: limit, categories, spend, linked accounts. Use when the user references a budget not already in the current context.",
      inputSchema: z.object({ budgetId: z.string() }),
      execute: async ({ budgetId }) => {
        const [budget] = await db
          .select()
          .from(budgets)
          .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
          .limit(1);

        if (!budget) return { error: "Budget not found" };

        const categories = await db
          .select()
          .from(budgetCategories)
          .where(eq(budgetCategories.budgetId, budgetId));

        return { budget, categories };
      },
    }),

    listActiveBudgets: tool({
      description: "List the user's currently active (non-archived) budgets.",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await db
          .select({
            id: budgets.id,
            name: budgets.name,
            limitAmount: budgets.limitAmount,
            startDate: budgets.startDate,
            endDate: budgets.endDate,
          })
          .from(budgets)
          .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
          .orderBy(desc(budgets.startDate))
          .limit(20);
        return rows;
      },
    }),

    getRecentTransactions: tool({
      description:
        "Get the user's most recent transactions, optionally filtered by category. Use when the user asks about recent spending not already in context.",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe("Filter to a specific category, if mentioned"),
        limit: z.number().int().min(1).max(30).default(10),
      }),
      execute: async ({ category, limit }) => {
        const conditions = [eq(transactions.userId, userId)];
        if (category)
          conditions.push(eq(transactions.category, category as never));

        const rows = await db
          .select({
            description: transactions.description,
            merchant: transactions.merchant,
            amount: transactions.amount,
            category: transactions.category,
            type: transactions.type,
            date: transactions.date,
          })
          .from(transactions)
          .where(and(...conditions))
          .orderBy(desc(transactions.date))
          .limit(limit);
        return rows;
      },
    }),
    renderSpendingChart: buildSpendingChartTool(userId),
  };
}
