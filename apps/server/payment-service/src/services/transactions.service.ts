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

async function invalidateUserTransactionCache(userId: string) {
  await Promise.all([
    cache.delPattern(`transactions:list:${userId}*`),
    cache.delPattern(`transactions:recent:${userId}*`),
    cache.delPattern(`transactions:overview:${userId}*`),
    cache.delPattern(`transactions:topCats:${userId}*`),
    cache.del(cacheKeys.transactions.spendingOverview(userId, "*")),
  ]);
}

export const TransactionsService = {
  // ── LIST (cursor-paginated, filterable) — cached per user + filter fingerprint
  async list(
    userId: string,
    input: TransactionsFilterInput,
  ): Promise<ServiceResult<PaginatedTransactions>> {
    const cacheKey = cacheKeys.transactions.list(
      userId,
      JSON.stringify({
        bankAccountId: input.bankAccountId,
        category: input.category,
        type: input.type,
        status: input.status,
        isAnomaly: input.isAnomaly,
        isManual: input.isManual,
        search: input.search,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        limit: input.limit,
        cursor: input.cursor,
      }),
    );

    return cache.getOrSet(
      cacheKey,
      async () => {
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
          if (dateFrom)
            conditions.push(gte(transactions.date, new Date(dateFrom)));
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
                and(
                  eq(transactions.id, cursorId),
                  eq(transactions.userId, userId),
                ),
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
            .leftJoin(
              bankAccounts,
              eq(transactions.bankAccountId, bankAccounts.id),
            )
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
      30, // 30s TTL — list pages are cursor-keyed so churn is low, but data should feel fresh
    );
  },

  // ── RECENT — cached, short TTL since it shows on the dashboard
  async recent(
    userId: string,
    limit = 7,
  ): Promise<ServiceResult<Transaction[]>> {
    const cacheKey = cacheKeys.transactions.recent(userId, limit);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const rows = await db
            .select(transactionSelect())
            .from(transactions)
            .leftJoin(
              bankAccounts,
              eq(transactions.bankAccountId, bankAccounts.id),
            )
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
      60, // 1 min TTL
    );
  },

  // ── GET BY ID — cached per transaction + user (ownership-scoped)
  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<Transaction>> {
    const cacheKey = cacheKeys.transactions.byId(id, userId);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const [row] = await db
            .select(transactionSelect())
            .from(transactions)
            .leftJoin(
              bankAccounts,
              eq(transactions.bankAccountId, bankAccounts.id),
            )
            .where(
              and(eq(transactions.id, id), eq(transactions.userId, userId)),
            )
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
      300, // 5 min TTL
    );
  },

  // ── CREATE — invalidate user caches
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

      if (!account) {
        return {
          success: false,
          error: "Bank account not found",
          code: "NOT_FOUND",
        };
      }

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

      await invalidateUserTransactionCache(userId);

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

  // ── UPDATE — invalidate specific entry + user caches
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

      await cache.del(cacheKeys.transactions.byId(input.id, userId));
      await invalidateUserTransactionCache(userId);

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

  // ── DELETE — invalidate caches
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

      await cache.del(cacheKeys.transactions.byId(id, userId));
      await invalidateUserTransactionCache(userId);

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

  // ── BATCH DELETE — invalidate caches
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

      // Invalidate individual byId entries for each deleted tx
      await Promise.all(
        deleted.map((d) =>
          cache.del(cacheKeys.transactions.byId(d.id, userId)),
        ),
      );
      await invalidateUserTransactionCache(userId);

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

  // ── SPENDING OVERVIEW — expensive aggregate, cached per user + period key
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
    const cacheKey = cacheKeys.transactions.spendingOverview(userId, periodKey);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const { period = "30d", from, to } = input;

          let startDate: Date;
          let endDate: Date;

          if (period === "7d") {
            startDate = startOfDay(subDays(new Date(), 7));
            endDate = endOfDay(new Date());
          } else if (period === "30d") {
            startDate = startOfDay(subDays(new Date(), 30));
            endDate = endOfDay(new Date());
          } else if (period === "90d") {
            startDate = startOfDay(subDays(new Date(), 90));
            endDate = endOfDay(new Date());
          } else if (from && to) {
            startDate = startOfDay(new Date(from));
            endDate = endOfDay(new Date(to));
          } else {
            startDate = startOfDay(subDays(new Date(), 30));
            endDate = endOfDay(new Date());
          }

          const categoryResult = await db
            .select({
              category: transactions.category,
              total: sql<number>`sum(${transactions.amount}::numeric)::float`,
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
            total: Number(r.total) || 0,
          }));

          const trendDay = sql<Date>`date_trunc('day', ${transactions.date})`;
          const trendResult = await db
            .select({
              date: trendDay,
              name: sql<string>`to_char(${trendDay}, 'Mon DD')`,
              value: sql<number>`sum(${transactions.amount}::numeric)::float`,
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
                limitAmount: sql<number>`${budgets.limitAmount}::numeric`,
              })
              .from(budgets)
              .where(and(eq(budgets.userId, userId), whereCondition));
          }

          const categoryBudgetMap = new Map<string, number>();
          budgetResult.forEach((b) => {
            const current = categoryBudgetMap.get(b.category) || 0;
            categoryBudgetMap.set(b.category, current + Number(b.limitAmount));
          });

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
              value: Number(t.value) || 0,
              budget: Number(budgetProgress.toFixed(2)),
              dailyBudget: Number(dailyBudget.toFixed(2)),
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
            success: true,
            data: {
              totalSpending,
              totalBudget,
              categorySpending: categorySpendingWithBudget,
              trendData,
            },
          };
        } catch (err) {
          console.error("[TransactionsService.getSpendingOverview]", err);
          return {
            success: false,
            error: "Failed to fetch spending overview",
            code: "INTERNAL_SERVER_ERROR",
          };
        }
      },
      120, // 2 min TTL — aggregate is expensive; stale by 2 min is acceptable
    );
  },

  // ── TOP CATEGORIES — cached per user + month/year
  async getTopCategories(
    userId: string,
    month: number,
    year: number,
    limit = 5,
  ): Promise<ServiceResult<TopMonthlyCategories>> {
    const cacheKey = cacheKeys.transactions.topCategories(userId, month, year);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0, 23, 59, 59);

          const [categoryResult, totalResult] = await Promise.all([
            db
              .select({
                category: transactions.category,
                total: sql<number>`sum(${transactions.amount}::numeric)::float`,
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
                total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)::float`,
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

          const totalSpending = totalResult[0]?.total ?? 0;

          if (!categoryResult.length) {
            return {
              success: true,
              data: {
                month,
                year,
                categories: [],
                totalSpending: 0,
                hasData: false,
              },
            };
          }

          return {
            success: true,
            data: {
              month,
              year,
              categories: categoryResult.map((r) => ({
                category: r.category ?? "other",
                total: r.total,
                count: r.count,
                percentage:
                  totalSpending > 0
                    ? Math.round((r.total / totalSpending) * 1000) / 10
                    : 0,
              })),
              totalSpending,
              hasData: true,
            },
          };
        } catch (err) {
          console.error("[TransactionsService.getTopCategories]", err);
          return {
            success: false,
            error: "Failed to fetch top categories",
            code: "DB_ERROR",
          };
        }
      },
      300, // 5 min TTL — monthly aggregates change infrequently
    );
  },

  // ── CURRENT MONTH SPENDING — dashboard stat, cached short
  async getCurrentMonthSpending(
    userId: string,
  ): Promise<ServiceResult<number>> {
    // Key by user + current month so it naturally expires at month boundary
    const now = new Date();
    const cacheKey =
      cacheKeys.transactions.topCategories(
        userId,
        now.getMonth() + 1,
        now.getFullYear(),
      ) + ":monthSpend";

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const [result] = await db
            .select({
              total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)::float`,
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

          return { success: true, data: result?.total ?? 0 };
        } catch (err) {
          console.error("[TransactionsService.getCurrentMonthSpending]", err);
          return {
            success: false,
            error: "Failed to calculate spending",
            code: "DB_ERROR",
          };
        }
      },
      60, // 1 min TTL — shown on dashboard, should feel reasonably live
    );
  },
} as const;
