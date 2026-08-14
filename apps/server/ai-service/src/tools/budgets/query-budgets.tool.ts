import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgetAccounts,
  budgetCategories,
  budgets,
  transactions,
} from "@neuralpay/db/schema";
import { tool } from "ai";
import { differenceInCalendarDays } from "date-fns";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { uuidInput } from "../lib/lean-schemas";

const STATUSES = ["on_track", "warning", "over"] as const;

function healthFor(percentUsed: number, threshold: number) {
  if (percentUsed >= 100) return "over";
  if (percentUsed >= threshold) return "warning";
  return "on_track";
}

export function buildQueryBudgetsTool(userId: string) {
  return tool({
    description:
      "List budgets with computed health (on_track/warning/over), percent used, and days remaining; optionally include per-category breakdown and linked accounts. Use for 'how am I doing on my budgets', 'list my budgets', or 'details of budget X'.",
    inputSchema: z.object({
      budgetId: uuidInput().optional(),
      status: z.enum(STATUSES).optional(),
      onlyActive: z.boolean().default(true),
      includeCategories: z.boolean().default(false),
      includeLinkedAccounts: z.boolean().default(false),
      limit: z.number().int().min(1).max(50).default(20),
    }),
    execute: async ({
      budgetId,
      status,
      onlyActive,
      includeCategories,
      includeLinkedAccounts,
      limit,
    }) => {
      const now = new Date();

      const conditions = [eq(budgets.userId, userId)];
      if (onlyActive) conditions.push(eq(budgets.isActive, true));
      if (budgetId) conditions.push(eq(budgets.id, budgetId));

      let budgetRows = await db
        .select()
        .from(budgets)
        .where(and(...conditions))
        .orderBy(desc(budgets.startDate));

      if (!budgetId) budgetRows = budgetRows.slice(0, limit);
      if (budgetRows.length === 0) return [];

      const fullDetail = Boolean(budgetId);
      const withCategories = includeCategories || fullDetail;
      const withLinked = includeLinkedAccounts || fullDetail;

      const budgetIds = budgetRows.map((b) => b.id);
      const categoryRows = await db
        .select()
        .from(budgetCategories)
        .where(inArray(budgetCategories.budgetId, budgetIds));

      // linkedAccounts only when requested — same relationship budget.context.ts
      // reads (spend stays scoped to a budget's linked accounts when it has any).
      let linkedByBudget = new Map<string, { id: string; name: string; type: string; bankName: string | null }[]>();
      if (withLinked) {
        const linkedRows = await db
          .select({
            budgetId: budgetAccounts.budgetId,
            id: bankAccounts.id,
            name: bankAccounts.name,
            type: bankAccounts.type,
            bankName: bankAccounts.bankName,
          })
          .from(budgetAccounts)
          .innerJoin(bankAccounts, eq(bankAccounts.id, budgetAccounts.bankAccountId))
          .where(inArray(budgetAccounts.budgetId, budgetIds));

        for (const row of linkedRows) {
          const list = linkedByBudget.get(row.budgetId) ?? [];
          list.push({ id: row.id, name: row.name, type: row.type, bankName: row.bankName });
          linkedByBudget.set(row.budgetId, list);
        }
      }

      const results = await Promise.all(
        budgetRows.map(async (budget) => {
          const cats = categoryRows.filter((c) => c.budgetId === budget.id);
          const accountIds = (linkedByBudget.get(budget.id) ?? []).map((a) => a.id);

          let totalSpent = 0;
          let categories: { category: string; limitAmount: number; spent: number; percentUsed: number }[] = [];

          // Spend scoped to THIS budget's date range + linked accounts (or all
          // accounts when none linked) — the budget.context.ts fix, preserved.
          if (cats.length > 0) {
            const spendConditions = [
              eq(transactions.userId, userId),
              eq(transactions.type, "debit"),
              gte(transactions.date, budget.startDate),
              lte(transactions.date, budget.endDate),
              inArray(
                transactions.category,
                cats.map((c) => c.category),
              ),
            ];
            if (accountIds.length > 0) {
              spendConditions.push(inArray(transactions.bankAccountId, accountIds));
            }

            const spendRows = await db
              .select({
                category: transactions.category,
                total:
                  sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
                    Number,
                  ),
              })
              .from(transactions)
              .where(and(...spendConditions))
              .groupBy(transactions.category);

            const spendMap = new Map(spendRows.map((r) => [r.category, r.total]));
            categories = cats.map((c) => {
              const spent = spendMap.get(c.category) ?? 0;
              const limitAmount = Number(c.limitAmount);
              return {
                category: c.category,
                limitAmount,
                spent,
                percentUsed:
                  limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0,
              };
            });
            totalSpent = spendRows.reduce((sum, r) => sum + r.total, 0);
          }

          const totalLimit = Number(budget.limitAmount);
          const percentUsed =
            totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
          const computedStatus = healthFor(percentUsed, budget.alertThreshold);
          const daysRemaining = Math.max(
            0,
            differenceInCalendarDays(new Date(budget.endDate), now),
          );

          return {
            id: budget.id,
            name: budget.name,
            description: budget.description,
            color: budget.color,
            limitAmount: totalLimit,
            period: budget.period,
            status: computedStatus,
            startDate: budget.startDate,
            endDate: budget.endDate,
            alertThreshold: budget.alertThreshold,
            isActive: budget.isActive,
            totalSpent,
            percentUsed,
            daysRemaining,
            ...(withCategories ? { categories } : {}),
            ...(withLinked
              ? { linkedAccounts: linkedByBudget.get(budget.id) ?? [] }
              : {}),
          };
        }),
      );

      if (status) return results.filter((r) => r.status === status);
      return results;
    },
  });
}
