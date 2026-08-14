import {
  bankAccounts,
  budgetAccounts,
  budgets,
  connectedPlaidBanks,
  db,
  transactions,
} from "@neuralpay/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";

export async function fetchAccountContext(
  userId: string,
  accountId: string,
): Promise<unknown> {
  const [account] = await db
    .select()
    .from(bankAccounts)
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
    .limit(1);

  if (!account) return { error: "Account not found" };

  const recentTransactions = await db
    .select({
      id: transactions.id,
      description: transactions.description,
      merchant: transactions.merchant,
      amount: transactions.amount,
      category: transactions.category,
      type: transactions.type,
      date: transactions.date,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.bankAccountId, accountId),
        eq(transactions.userId, userId),
      ),
    )
    .orderBy(desc(transactions.date))
    .limit(10);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthSpend] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.bankAccountId, accountId),
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, monthStart),
      ),
    );

  // Budgets this account is being tracked under — same relationship
  // BudgetsService.loadAccounts reads, just inverted (account → budgets).
  const linkedBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      limitAmount: budgets.limitAmount,
      isActive: budgets.isActive,
    })
    .from(budgetAccounts)
    .innerJoin(budgets, eq(budgets.id, budgetAccounts.budgetId))
    .where(eq(budgetAccounts.bankAccountId, accountId));

  let connectedBank: { institutionName: string | null } | null = null;
  if (!account.isManual && account.plaidItemId) {
    const [bank] = await db
      .select({ institutionName: connectedPlaidBanks.institutionName })
      .from(connectedPlaidBanks)
      .where(
        and(
          eq(connectedPlaidBanks.userId, userId),
          eq(connectedPlaidBanks.itemId, account.plaidItemId),
        ),
      )
      .limit(1);
    connectedBank = bank ?? null;
  }

  return {
    account,
    recentTransactions,
    currentMonthSpending: monthSpend?.total ?? 0,
    currentMonthTransactionCount: monthSpend?.count ?? 0,
    linkedBudgets,
    connectedBank,
  };
}
