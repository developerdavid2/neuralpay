import { db } from "@neuralpay/db";
import { bankAccounts, transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { startOfMonth } from "date-fns";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildGetAccountUtilizationTool(userId: string) {
  return tool({
    description:
      "Get each account's balance alongside this month's spend against it, so the model can flag accounts running low relative to their outflow. Use when the user asks if an account is healthy, running low, or being drained.",
    inputSchema: z.object({}),
    execute: async () => {
      const monthStart = startOfMonth(new Date());

      const accounts = await db
        .select({
          id: bankAccounts.id,
          name: bankAccounts.name,
          balance: bankAccounts.balance,
          type: bankAccounts.type,
        })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        );

      const spend = await db
        .select({
          bankAccountId: transactions.bankAccountId,
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
            Number,
          ),
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, monthStart),
          ),
        )
        .groupBy(transactions.bankAccountId);

      const spendMap = new Map(spend.map((s) => [s.bankAccountId, s.total]));

      return accounts.map((a) => {
        const balance = Number(a.balance);
        const monthSpend = spendMap.get(a.id) ?? 0;
        return {
          name: a.name,
          type: a.type,
          balance,
          currentMonthSpend: monthSpend,
          // Rough runway signal — not a forecast, just a coarse flag for
          // the model to reason about, not to state as a precise fact.
          spendToBalanceRatio:
            balance > 0 ? Math.round((monthSpend / balance) * 100) : null,
        };
      });
    },
  });
}
