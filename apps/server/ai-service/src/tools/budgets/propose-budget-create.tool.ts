import { randomUUID } from "node:crypto";
import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import type { BudgetCategory } from "@neuralpay/types";
import { tool } from "ai";
import { subMonths } from "date-fns";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildProposeBudgetCreateTool(userId: string) {
  return tool({
    description:
      "Draft a new budget proposal for user confirmation (never creates directly). Use when the user wants a budget they don't have. Base the limit on their actual recent spending where possible.",
    inputSchema: z.object({
      name: z.string(),
      period: z.enum(["weekly", "monthly", "custom"]).default("monthly"),
      categories: z.array(
        z.object({
          category: z.string(),
          limitAmount: z.number().positive(),
        }),
      ),
      alertThreshold: z.number().int().min(1).max(100).default(80),
      reasoning: z.string(),
    }),
    execute: async ({
      name,
      period,
      categories,
      alertThreshold,
      reasoning,
    }) => {
      const limitAmount = categories.reduce((sum, c) => sum + c.limitAmount, 0);

      const now = new Date();
      let startDate = now;
      let endDate = now;
      if (period === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === "weekly") {
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      }

      // Give the frontend the last-3-months average per requested category
      // so the confirmation card can show "you're already spending ~$X" —
      // grounds the proposal in real numbers rather than a blind guess.
      const threeMonthsAgo = subMonths(now, 3);
      const recentSpend = await db
        .select({
          category: transactions.category,
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
            Number,
          ),
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, threeMonthsAgo),
          ),
        )
        .groupBy(transactions.category);

      const spendMap = new Map(recentSpend.map((r) => [r.category, r.total]));

      return {
        proposalId: randomUUID(),
        kind: "budget_create" as const,
        draft: {
          name,
          period,
          limitAmount,
          categories,
          alertThreshold,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        context: {
          categoriesRecentAvgMonthly: categories.map((c) => ({
            category: c.category,
            recentThreeMonthTotal:
              spendMap.get(c.category as BudgetCategory) ?? 0,
          })),
        },
        reasoning,
      };
    },
  });
}
