import { budgetCategories, budgets, db, transactions } from "@orra/db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

export async function fetchTransactionContext(
  userId: string,
  transactionId: string,
): Promise<unknown> {
  const [transaction] = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      category: transactions.category,
      merchant: transactions.merchant,
      notes: transactions.notes,
      bankAccountId: transactions.bankAccountId,
    })
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
    )
    .limit(1);

  if (!transaction) return { error: "Transaction not found" };

  const similarTransactions = await db
    .select({
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      category: transactions.category,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, transaction.category!),
        sql`${transactions.id} != ${transactionId}`,
      ),
    )
    .orderBy(desc(transactions.date))
    .limit(5);

  // Excludes this transaction now, matching similarTransactions — previously
  // this transaction's own amount was silently pulled into its own average.
  const [categoryAvg] = await db
    .select({
      avg: sql<number>`AVG(ABS(${transactions.amount}))`.mapWith(Number),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, transaction.category!),
        sql`${transactions.id} != ${transactionId}`,
      ),
    );

  // Any active budget whose category allocations and date range cover this
  // transaction — so the AI can say "this pushed you over your Dining budget"
  // rather than only knowing the transaction in isolation.
  const relevantBudgets = transaction.category
    ? await db
        .select({
          id: budgets.id,
          name: budgets.name,
          categoryLimit: budgetCategories.limitAmount,
        })
        .from(budgets)
        .innerJoin(budgetCategories, eq(budgetCategories.budgetId, budgets.id))
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.isActive, true),
            eq(budgetCategories.category, transaction.category),
            lte(budgets.startDate, transaction.date),
            gte(budgets.endDate, transaction.date),
          ),
        )
    : [];

  return {
    transaction,
    similarTransactions,
    categoryAverage: categoryAvg?.avg ?? 0,
    categoryCount: categoryAvg?.count ?? 0,
    relevantBudgets,
  };
}
