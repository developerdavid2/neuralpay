import { db } from "@orra/db";
import { transactions } from "@orra/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

const SUM_TOTAL = sql<number>`COALESCE(SUM(${transactions.amount}), 0)`;

function spendingWhere(
  userId: string,
  startDate: Date,
  endDate?: Date,
  category?: string,
) {
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, "debit"),
    gte(transactions.date, startDate),
  ];
  if (endDate) conditions.push(lte(transactions.date, endDate));
  if (category) conditions.push(eq(transactions.category, category as never));
  return conditions;
}

export interface CategoryTotal {
  category: string | null;
  total: number;
  count?: number;
}

export interface CategorySpendingInput {
  startDate: Date;
  endDate?: Date;
  includeCount?: boolean;
  limit?: number;
  category?: string;
}

/** Debit totals grouped by category for a date range, ranked by amount. */
export async function fetchCategorySpending(
  userId: string,
  input: CategorySpendingInput,
): Promise<CategoryTotal[]> {
  const { startDate, endDate, includeCount = false, limit, category } = input;

  const query = db
    .select({
      category: transactions.category,
      total: SUM_TOTAL.mapWith(Number),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(and(...spendingWhere(userId, startDate, endDate, category)))
    .groupBy(transactions.category)
    .orderBy(desc(sql`SUM(${transactions.amount})`));

  const rows =
    typeof limit === "number" ? await query.limit(limit) : await query;

  if (!includeCount) {
    return rows.map(({ category, total }) => ({ category, total }));
  }
  return rows;
}

export interface TrendSpendPoint {
  label: string;
  value: number;
}

export type TrendGranularity = "day" | "week";

/** Debit totals grouped by day or week for a date range, ascending. */
export async function fetchTrendSpending(
  userId: string,
  startDate: Date,
  endDate: Date,
  granularity: TrendGranularity = "day",
  category?: string,
): Promise<TrendSpendPoint[]> {
  const trendUnit =
    granularity === "week"
      ? sql<Date>`date_trunc('week', ${transactions.date})`
      : sql<Date>`date_trunc('day', ${transactions.date})`;

  const rows = await db
    .select({
      label: sql<string>`to_char(${trendUnit}, 'Mon DD')`,
      value: sql<string>`sum(${transactions.amount}::numeric)::text`,
    })
    .from(transactions)
    .where(and(...spendingWhere(userId, startDate, endDate, category)))
    .groupBy(trendUnit)
    .orderBy(trendUnit);

  return rows.map((t) => ({
    label: t.label,
    value: parseFloat(t.value ?? "0"),
  }));
}

/** Total debit spend for a date range (used for period-to-period comparisons). */
export async function fetchTotalSpending(
  userId: string,
  startDate: Date,
  endDate: Date,
  category?: string,
): Promise<number> {
  const [result] = await db
    .select({ total: SUM_TOTAL.mapWith(Number) })
    .from(transactions)
    .where(and(...spendingWhere(userId, startDate, endDate, category)));
  return result?.total ?? 0;
}
