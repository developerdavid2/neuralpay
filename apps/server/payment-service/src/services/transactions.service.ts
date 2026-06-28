import { db } from "@neuralpay/db";
import { bankAccounts, budgets, transactions } from "@neuralpay/db/schema";
import {
  type BatchDeleteInput,
  type CreateTransactionInput,
  type OverviewTotal,
  type PaginatedTransactions,
  type ServiceResult,
  type TopMonthlyCategories,
  type Transaction,
  type TransactionsFilterInput,
  type TxMonthlySummaryFilterInput,
  type UpdateTransactionInput,
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@neuralpay/types";
import {
  differenceInDays,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import {
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { cache, cacheKeys } from "@neuralpay/cache";

function transactionSelect() {
  return {
    ...getTableColumns(transactions),
    bankAccountName: bankAccounts.name,
    bankAccountType: bankAccounts.type,
    bankName: bankAccounts.bankName,
    currency: bankAccounts.currency,
    maskedNumber: bankAccounts.maskedNumber,
  };
}

async function invalidateAggregateCache(userId: string) {
  await Promise.allSettled([
    cache.delPattern(cacheKeys.transactions.patterns.overview(userId)),
    cache.delPattern(cacheKeys.transactions.patterns.topCats(userId)),
    cache.delPattern(cacheKeys.transactions.patterns.monthSpend(userId)),
    cache.delPattern(cacheKeys.transactions.patterns.monthlySummaries(userId)),
  ]);
}

export const TransactionsService = {
  async list(
    userId: string,
    input: TransactionsFilterInput,
  ): Promise<ServiceResult<PaginatedTransactions>> {
    try {
      const {
        bankAccountId,
        category,
        type,
        status,
        isAnomaly,
        isManual,
        search,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        limit,
        cursor,
      } = input;

      const conditions = [eq(transactions.userId, userId)];

      if (bankAccountId)
        conditions.push(eq(transactions.bankAccountId, bankAccountId));
      if (type) {
        const types = Array.isArray(type) ? type : [type];
        if (types.length > 0 && types.length < TRANSACTION_TYPE.length) {
          conditions.push(
            inArray(
              transactions.type,
              types as (typeof TRANSACTION_TYPE)[number][],
            ),
          );
        }
      }
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        if (
          statuses.length > 0 &&
          statuses.length < TRANSACTION_STATUS.length
        ) {
          conditions.push(
            inArray(
              transactions.status,
              statuses as (typeof TRANSACTION_STATUS)[number][],
            ),
          );
        }
      }
      if (isAnomaly !== undefined)
        conditions.push(eq(transactions.isAnomaly, isAnomaly));
      if (isManual !== undefined)
        conditions.push(eq(transactions.isManual, isManual));
      if (dateFrom) conditions.push(gte(transactions.date, new Date(dateFrom)));
      if (dateTo) conditions.push(lte(transactions.date, new Date(dateTo)));
      if (minAmount !== undefined)
        conditions.push(gte(transactions.amount, minAmount.toString()));
      if (maxAmount !== undefined)
        conditions.push(lte(transactions.amount, maxAmount.toString()));

      if (search) {
        const s = `%${search}%`;
        const searchCond = or(
          ilike(transactions.description, s),
          ilike(transactions.merchant, s),
        );
        if (searchCond) conditions.push(searchCond);
      }

      if (category) {
        const categories = Array.isArray(category) ? category : [category];
        if (
          categories.length > 0 &&
          categories.length < TRANSACTION_CATEGORY.length
        ) {
          conditions.push(
            inArray(
              transactions.category,
              categories as (typeof TRANSACTION_CATEGORY)[number][],
            ),
          );
        }
      }

      if (cursor) {
        const cursorId = Buffer.from(cursor, "base64url").toString("utf-8");
        const [cursorRow] = await db
          .select({ id: transactions.id, date: transactions.date })
          .from(transactions)
          .where(
            and(eq(transactions.id, cursorId), eq(transactions.userId, userId)),
          )
          .limit(1);

        if (cursorRow) {
          const cursorRowCondition = or(
            sql`${transactions.date} < ${cursorRow.date}`,
            and(
              eq(transactions.date, cursorRow.date),
              sql`${transactions.id} < ${cursorRow.id}`,
            ),
          );
          if (cursorRowCondition) conditions.push(cursorRowCondition);
        }
      }

      const rows = await db
        .select(transactionSelect())
        .from(transactions)
        .leftJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
        .where(and(...conditions))
        .orderBy(desc(transactions.date), desc(transactions.id))
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const last = items[items.length - 1];
      const nextCursor =
        hasMore && last ? Buffer.from(last.id).toString("base64url") : null;

      return { success: true, data: { items, nextCursor } };
    } catch (err) {
      console.error("[TransactionsService.list]", err);
      return {
        success: false,
        error: "Failed to fetch transactions",
        code: "DB_ERROR",
      };
    }
  },

  async recent(
    userId: string,
    limit = 7,
  ): Promise<ServiceResult<Transaction[]>> {
    try {
      const rows = await db
        .select(transactionSelect())
        .from(transactions)
        .leftJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date))
        .limit(limit);

      return { success: true, data: rows };
    } catch (err) {
      console.error("[TransactionsService.recent]", err);
      return {
        success: false,
        error: "Failed to fetch recent transactions",
        code: "DB_ERROR",
      };
    }
  },

  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<Transaction>> {
    try {
      const [row] = await db
        .select(transactionSelect())
        .from(transactions)
        .leftJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .limit(1);

      if (!row)
        return {
          success: false,
          error: "Transaction not found",
          code: "NOT_FOUND",
        };

      return { success: true, data: row };
    } catch (err) {
      console.error("[TransactionsService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch transaction",
        code: "DB_ERROR",
      };
    }
  },

  async create(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<ServiceResult<Transaction>> {
    try {
      const [account] = await db
        .select({ id: bankAccounts.id })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.id, input.bankAccountId),
            eq(bankAccounts.userId, userId),
          ),
        )
        .limit(1);

      if (!account)
        return {
          success: false,
          error: "Bank account not found",
          code: "NOT_FOUND",
        };

      const [created] = await db
        .insert(transactions)
        .values({
          userId,
          bankAccountId: input.bankAccountId,
          description: input.description,
          amount: input.amount.toString(),
          type: input.type,
          status: input.status,
          category: input.category,
          merchant: input.merchant ?? null,
          date: new Date(input.date),
          isManual: true,
          notes: input.notes ?? null,
          isAnomaly: false,
        })
        .returning();

      await invalidateAggregateCache(userId);

      return this.getById(created!.id, userId);
    } catch (err) {
      console.error("[TransactionsService.create]", err);
      return {
        success: false,
        error: "Failed to create transaction",
        code: "DB_ERROR",
      };
    }
  },

  async update(
    userId: string,
    input: UpdateTransactionInput,
  ): Promise<ServiceResult<Transaction>> {
    try {
      const updateData: Record<string, unknown> = {};

      if (input.bankAccountId !== undefined) {
        const [acct] = await db
          .select({ id: bankAccounts.id })
          .from(bankAccounts)
          .where(
            and(
              eq(bankAccounts.id, input.bankAccountId),
              eq(bankAccounts.userId, userId),
            ),
          )
          .limit(1);
        if (!acct)
          return {
            success: false,
            error: "Bank account not found",
            code: "NOT_FOUND",
          };
        updateData.bankAccountId = input.bankAccountId;
      }
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.merchant !== undefined) updateData.merchant = input.merchant;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.date !== undefined) updateData.date = new Date(input.date);
      if (input.amount !== undefined)
        updateData.amount = input.amount.toString();
      if (input.type !== undefined) updateData.type = input.type;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.category !== undefined) updateData.category = input.category;

      if (Object.keys(updateData).length === 0) {
        return this.getById(input.id, userId);
      }

      const [updated] = await db
        .update(transactions)
        .set(updateData)
        .where(
          and(eq(transactions.id, input.id), eq(transactions.userId, userId)),
        )
        .returning({ id: transactions.id });

      if (!updated)
        return {
          success: false,
          error: "Transaction not found",
          code: "NOT_FOUND",
        };

      await invalidateAggregateCache(userId);

      return this.getById(input.id, userId);
    } catch (err) {
      console.error("[TransactionsService.update]", err);
      return {
        success: false,
        error: "Failed to update transaction",
        code: "DB_ERROR",
      };
    }
  },

  async delete(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [deleted] = await db
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning({ id: transactions.id });

      if (!deleted)
        return {
          success: false,
          error: "Transaction not found",
          code: "NOT_FOUND",
        };

      await invalidateAggregateCache(userId);

      return { success: true, data: { id: deleted.id } };
    } catch (err) {
      console.error("[TransactionsService.delete]", err);
      return {
        success: false,
        error: "Failed to delete transaction",
        code: "DB_ERROR",
      };
    }
  },

  async batchDelete(
    userId: string,
    input: BatchDeleteInput,
  ): Promise<ServiceResult<{ deleted: number; ids: string[] }>> {
    try {
      const deleted = await db
        .delete(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            inArray(transactions.id, input.ids),
            eq(transactions.isManual, true),
          ),
        )
        .returning({ id: transactions.id });

      await invalidateAggregateCache(userId);

      return {
        success: true,
        data: { deleted: deleted.length, ids: deleted.map((d) => d.id) },
      };
    } catch (err) {
      console.error("[TransactionsService.batchDelete]", err);
      return {
        success: false,
        error: "Failed to delete transactions",
        code: "DB_ERROR",
      };
    }
  },

  async getSpendingOverview(
    userId: string,
    input: {
      period?: "7d" | "30d" | "90d" | "custom";
      from?: string;
      to?: string;
    },
  ): Promise<ServiceResult<OverviewTotal>> {
    const periodKey =
      input.period === "custom"
        ? `custom:${input.from}:${input.to}`
        : (input.period ?? "30d");

    try {
      const data = await cache.getOrSet(
        cacheKeys.transactions.spendingOverview(userId, periodKey),
        async () => {
          const { period = "30d", from, to } = input;

          let startDate: Date;
          let endDate: Date;
          const now = new Date();

          if (from && to) {
            startDate = startOfDay(new Date(from));
            endDate = endOfDay(new Date(to));
          } else if (period === "7d") {
            startDate = startOfDay(subDays(now, 6));
            endDate = endOfDay(now);
          } else if (period === "90d") {
            startDate = startOfDay(subDays(now, 89));
            endDate = endOfDay(now);
          } else {
            startDate = startOfDay(subDays(now, 29));
            endDate = endOfDay(now);
          }
          const categoryResult = await db
            .select({
              category: transactions.category,
              total: sql<string>`sum(${transactions.amount}::numeric)::text`,
            })
            .from(transactions)
            .where(
              and(
                eq(transactions.userId, userId),
                eq(transactions.type, "debit"),
                gte(transactions.date, startDate),
                lte(transactions.date, endDate),
              ),
            )
            .groupBy(transactions.category)
            .orderBy(desc(sql`sum(${transactions.amount}::numeric)`));

          const categorySpending = categoryResult.map((r) => ({
            category: r.category ?? "other",
            total: parseFloat(r.total ?? "0"),
          }));

          const trendDay = sql<Date>`date_trunc('day', ${transactions.date})`;
          const trendResult = await db
            .select({
              date: trendDay,
              name: sql<string>`to_char(${trendDay}, 'Mon DD')`,
              value: sql<string>`sum(${transactions.amount}::numeric)::text`,
            })
            .from(transactions)
            .where(
              and(
                eq(transactions.userId, userId),
                eq(transactions.type, "debit"),
                gte(transactions.date, startDate),
                lte(transactions.date, endDate),
              ),
            )
            .groupBy(trendDay)
            .orderBy(trendDay);

          const monthYearPairs: Array<{ month: number; year: number }> = [];
          let currentDate = startOfMonth(startDate);
          const periodEnd = endOfMonth(endDate);

          while (currentDate <= periodEnd) {
            monthYearPairs.push({
              month: currentDate.getMonth() + 1,
              year: currentDate.getFullYear(),
            });
            currentDate = startOfMonth(subMonths(currentDate, -1));
          }

          let budgetResult: Array<any> = [];
          if (monthYearPairs.length > 0) {
            const monthYearConditions = monthYearPairs.map((p) =>
              and(eq(budgets.month, p.month), eq(budgets.year, p.year)),
            );
            const whereCondition =
              monthYearConditions.length === 1
                ? monthYearConditions[0]
                : or(...monthYearConditions);

            budgetResult = await db
              .select({
                category: budgets.category,
                month: budgets.month,
                year: budgets.year,
                limitAmount: sql<string>`${budgets.limitAmount}::numeric::text`,
              })
              .from(budgets)
              .where(and(eq(budgets.userId, userId), whereCondition));
          }

          const categoryBudgetMap = new Map<string, number>();

          for (const b of budgetResult) {
            const monthStart = new Date(b.year, b.month - 1, 1);
            const monthEnd = endOfMonth(monthStart);

            // Clamp to the selected range
            const overlapStart =
              monthStart < startDate ? startDate : monthStart;
            const overlapEnd = monthEnd > endDate ? endDate : monthEnd;

            const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;
            const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;

            // Prorate: only count the fraction of the budget that overlaps the window
            const prorated =
              (parseFloat(b.limitAmount ?? "0") * overlapDays) /
              totalDaysInMonth;

            const current = categoryBudgetMap.get(b.category) || 0;
            categoryBudgetMap.set(b.category, current + prorated);
          }

          const totalBudget = Array.from(categoryBudgetMap.values()).reduce(
            (sum, amount) => sum + amount,
            0,
          );
          const daysInPeriod = differenceInDays(endDate, startDate) + 1;
          const dailyBudget = daysInPeriod > 0 ? totalBudget / daysInPeriod : 0;

          const trendData = trendResult.map((t) => {
            const daysElapsedInRange = differenceInDays(
              new Date(t.date),
              startDate,
            );
            const budgetProgress = dailyBudget * (daysElapsedInRange + 1);
            return {
              name: t.name,
              value: parseFloat(t.value ?? "0"),
              budget: parseFloat(budgetProgress.toFixed(2)),
              dailyBudget: parseFloat(dailyBudget.toFixed(2)),
            };
          });

          const categorySpendingWithBudget = categorySpending.map((item) => ({
            ...item,
            budget: categoryBudgetMap.get(item.category) || 0,
          }));

          const totalSpending = categorySpending.reduce(
            (sum, item) => sum + item.total,
            0,
          );

          return {
            totalSpending,
            totalBudget,
            categorySpending: categorySpendingWithBudget,
            trendData,
          };
        },
        120,
      );

      return { success: true, data };
    } catch (err) {
      console.error("[TransactionsService.getSpendingOverview]", err);
      return {
        success: false,
        error: "Failed to fetch spending overview",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async getTopCategories(
    userId: string,
    month: number,
    year: number,
    limit = 10,
  ): Promise<ServiceResult<TopMonthlyCategories>> {
    try {
      const data = await cache.getOrSet(
        `${cacheKeys.transactions.topCategories(userId, month, year)}:${limit}`,
        async () => {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0, 23, 59, 59);

          const [categoryResult, totalResult] = await Promise.all([
            db
              .select({
                category: transactions.category,
                total: sql<string>`sum(${transactions.amount}::numeric)::text`,
                count: sql<number>`count(*)::int`,
              })
              .from(transactions)
              .where(
                and(
                  eq(transactions.userId, userId),
                  eq(transactions.type, "debit"),
                  gte(transactions.date, startDate),
                  lte(transactions.date, endDate),
                ),
              )
              .groupBy(transactions.category)
              .orderBy(desc(sql`sum(${transactions.amount}::numeric)`))
              .limit(limit),

            db
              .select({
                total: sql<string>`coalesce(sum(${transactions.amount}::numeric), '0')::text`,
              })
              .from(transactions)
              .where(
                and(
                  eq(transactions.userId, userId),
                  eq(transactions.type, "debit"),
                  gte(transactions.date, startDate),
                  lte(transactions.date, endDate),
                ),
              ),
          ]);

          if (!categoryResult.length) {
            return {
              month,
              year,
              categories: [],
              totalSpending: 0,
              hasData: false,
            };
          }

          const totalSpendingRaw = parseFloat(totalResult[0]?.total ?? "0");

          return {
            month,
            year,
            categories: categoryResult.map((r) => {
              const total = parseFloat(r.total ?? "0");
              return {
                category: r.category ?? "other",
                total,
                count: r.count,
                percentage:
                  totalSpendingRaw > 0
                    ? Math.round((total / totalSpendingRaw) * 1000) / 10
                    : 0,
              };
            }),
            totalSpending: totalSpendingRaw,
            hasData: true,
          };
        },
        300,
      );

      return { success: true, data };
    } catch (err) {
      console.error("[TransactionsService.getTopCategories]", err);
      return {
        success: false,
        error: "Failed to fetch top categories",
        code: "DB_ERROR",
      };
    }
  },

  async getCurrentMonthSpending(
    userId: string,
  ): Promise<ServiceResult<number>> {
    const now = new Date();

    try {
      const data = await cache.getOrSet(
        cacheKeys.transactions.monthSpend(
          userId,
          now.getFullYear(),
          now.getMonth() + 1,
        ),
        async () => {
          const [result] = await db
            .select({
              total: sql<string>`coalesce(sum(${transactions.amount}::numeric), '0')::text`,
            })
            .from(transactions)
            .where(
              and(
                eq(transactions.userId, userId),
                eq(transactions.type, "debit"),
                gte(transactions.date, startOfMonth(now)),
                lte(transactions.date, endOfMonth(now)),
              ),
            );

          return parseFloat(result?.total ?? "0");
        },
        300,
      );

      return { success: true, data };
    } catch (err) {
      console.error("[TransactionsService.getCurrentMonthSpending]", err);
      return {
        success: false,
        error: "Failed to calculate spending",
        code: "DB_ERROR",
      };
    }
  },

  async getMonthlySummaries(
    userId: string,
    input: TxMonthlySummaryFilterInput,
  ): Promise<
    ServiceResult<
      Array<{ monthKey: string; count: number; totalSpent: number }>
    >
  > {
    try {
      const data = await cache.getOrSet(
        cacheKeys.transactions.monthlySummaries(userId, JSON.stringify(input)),
        async () => {
          const conditions = [eq(transactions.userId, userId)];

          if (input.bankAccountId)
            conditions.push(
              eq(transactions.bankAccountId, input.bankAccountId),
            );
          if (input.type) {
            const types = Array.isArray(input.type) ? input.type : [input.type];
            if (types.length > 0 && types.length < TRANSACTION_TYPE.length) {
              conditions.push(
                inArray(
                  transactions.type,
                  types as (typeof TRANSACTION_TYPE)[number][],
                ),
              );
            }
          }
          if (input.status) {
            const statuses = Array.isArray(input.status)
              ? input.status
              : [input.status];
            if (
              statuses.length > 0 &&
              statuses.length < TRANSACTION_STATUS.length
            ) {
              conditions.push(
                inArray(
                  transactions.status,
                  statuses as (typeof TRANSACTION_STATUS)[number][],
                ),
              );
            }
          }
          if (input.category) {
            const categories = Array.isArray(input.category)
              ? input.category
              : [input.category];
            if (
              categories.length > 0 &&
              categories.length < TRANSACTION_CATEGORY.length
            ) {
              conditions.push(
                inArray(
                  transactions.category,
                  categories as (typeof TRANSACTION_CATEGORY)[number][],
                ),
              );
            }
          }
          if (input.isAnomaly !== undefined)
            conditions.push(eq(transactions.isAnomaly, input.isAnomaly));
          if (input.isManual !== undefined)
            conditions.push(eq(transactions.isManual, input.isManual));
          if (input.dateFrom)
            conditions.push(gte(transactions.date, new Date(input.dateFrom)));
          if (input.dateTo)
            conditions.push(lte(transactions.date, new Date(input.dateTo)));
          if (input.minAmount !== undefined)
            conditions.push(
              gte(transactions.amount, input.minAmount.toString()),
            );
          if (input.maxAmount !== undefined)
            conditions.push(
              lte(transactions.amount, input.maxAmount.toString()),
            );
          if (input.search) {
            const s = `%${input.search}%`;
            const searchCond = or(
              ilike(transactions.description, s),
              ilike(transactions.merchant, s),
            );
            if (searchCond) conditions.push(searchCond);
          }

          const monthCol = sql<string>`to_char(date_trunc('month', ${transactions.date}), 'YYYY-MM')`;

          const rows = await db
            .select({
              monthKey: monthCol,
              count: sql<number>`count(*)::int`,
              totalSpent: sql<string>`coalesce(sum(${transactions.amount}::numeric), '0')::text`,
            })
            .from(transactions)
            .where(and(...conditions))
            .groupBy(monthCol)
            .orderBy(desc(monthCol));

          return rows.map((r) => ({
            monthKey: r.monthKey,
            count: r.count,
            totalSpent: parseFloat(r.totalSpent),
          }));
        },
        60,
      );

      return { success: true, data };
    } catch (err) {
      console.error("[TransactionsService.getMonthlySummaries]", err);
      return {
        success: false,
        error: "Failed to fetch monthly summaries",
        code: "DB_ERROR",
      };
    }
  },
} as const;
