import { db } from "@neuralpay/db";
import { bankAccounts, transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { startOfMonth } from "date-fns";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { uuidInput } from "../lib/lean-schemas";

export function buildGetAccountsTool(userId: string) {
  return tool({
    description:
      "List the user's bank accounts with balance, type, institution, and optional current-month spend. Use for 'show my accounts', 'account balances', or 'which account spends the most this month'.",
    inputSchema: z.object({
      accountId: uuidInput().optional(),
      includeMonthlySpend: z.boolean().default(false),
      onlyActive: z.boolean().default(true),
    }),
    execute: async ({ accountId, includeMonthlySpend, onlyActive }) => {
      const conditions = [eq(bankAccounts.userId, userId)];
      if (accountId) conditions.push(eq(bankAccounts.id, accountId));
      if (onlyActive) conditions.push(eq(bankAccounts.status, "active"));

      const accounts = await db
        .select({
          id: bankAccounts.id,
          name: bankAccounts.name,
          type: bankAccounts.type,
          subtype: bankAccounts.subtype,
          bankName: bankAccounts.bankName,
          balance: bankAccounts.balance,
          currency: bankAccounts.currency,
          isManual: bankAccounts.isManual,
          status: bankAccounts.status,
          lastSyncedAt: bankAccounts.lastSyncedAt,
        })
        .from(bankAccounts)
        .where(and(...conditions));

      if (accounts.length === 0) return [];

      let spendMap = new Map<string, number>();
      if (includeMonthlySpend) {
        const monthStart = startOfMonth(new Date());
        const spend = await db
          .select({
            bankAccountId: transactions.bankAccountId,
            total:
              sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
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

        spendMap = new Map(spend.map((s) => [s.bankAccountId, s.total]));
      }

      return accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        subtype: a.subtype,
        bankName: a.bankName,
        balance: Number(a.balance),
        currency: a.currency,
        isManual: a.isManual,
        status: a.status,
        lastSyncedAt: a.lastSyncedAt,
        ...(includeMonthlySpend
          ? { currentMonthSpend: spendMap.get(a.id) ?? 0 }
          : {}),
      }));
    },
  });
}
