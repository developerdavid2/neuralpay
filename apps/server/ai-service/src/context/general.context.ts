import {
  bankAccounts,
  budgets,
  connectedPlaidBanks,
  db,
  transactions,
  vaults,
} from "@neuralpay/db";
import { startOfDay } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

export async function fetchGeneralContext(userId: string): Promise<unknown> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentMonthSpending = await db
    .select({
      category: transactions.category,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, startOfMonth),
      ),
    )
    .groupBy(transactions.category)
    .orderBy(desc(sql`SUM(${transactions.amount})`));

  const [lastMonthTotal] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, startOfLastMonth),
        lte(transactions.date, endOfLastMonth),
      ),
    );

  // All non-archived budgets, kept compact for the prompt budget. Only the
  // ones active TODAY are included in the JSON (capped); broader budget
  // questions fall back to queryBudgets.
  const allBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      limitAmount: budgets.limitAmount,
      startDate: budgets.startDate,
      endDate: budgets.endDate,
      period: budgets.period,
    })
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
    .orderBy(desc(budgets.startDate))
    .limit(20);

  // Precompute "is this active TODAY" in code rather than asking the model
  // to do date-range arithmetic from raw ISO strings — this is the actual
  // fix for "AI says no budget matches today's date" when one clearly does.
  const budgetsActiveToday = allBudgets
    .filter(
      (b) =>
        startOfDay(b.startDate) <= startOfDay(now) &&
        startOfDay(b.endDate) >= startOfDay(now),
    )
    .slice(0, 5);

  const accounts = await db
    .select({
      name: bankAccounts.name,
      balance: bankAccounts.balance,
      type: bankAccounts.type,
      isManual: bankAccounts.isManual,
    })
    .from(bankAccounts)
    .where(
      and(eq(bankAccounts.userId, userId), eq(bankAccounts.status, "active")),
    )
    .limit(5);

  const connectedBanks = await db
    .select({ institutionName: connectedPlaidBanks.institutionName })
    .from(connectedPlaidBanks)
    .where(eq(connectedPlaidBanks.userId, userId));

  const recentTransactions = await db
    .select({
      description: transactions.description,
      merchant: transactions.merchant,
      amount: transactions.amount,
      category: transactions.category,
      type: transactions.type,
      date: transactions.date,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(3);

  const userVaults = await db
    .select()
    .from(vaults)
    .where(eq(vaults.userId, userId))
    .limit(3);

  return {
    today: now.toISOString().split("T")[0],
    currentMonthSpending: {
      total: currentMonthSpending.reduce((sum, c) => sum + c.total, 0),
      byCategory: currentMonthSpending.slice(0, 3),
    },
    lastMonthTotal: lastMonthTotal?.total ?? 0,
    // Explicitly pre-filtered — the model should treat this as the
    // authoritative answer to "what's active today", not recompute it.
    budgetsActiveToday,
    accounts,
    connectedBanks,
    recentTransactions,
    vaults: userVaults,
  };
}
