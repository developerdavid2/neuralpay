import { cache, cacheKeys } from "@neuralpay/redis";
import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgetAccounts,
  budgetCategories,
  budgets,
  transactions,
} from "@neuralpay/db/schema";
import {
  type Budget,
  type BudgetAccountRef,
  type BudgetCalendarDay,
  type BudgetCategoryDetail,
  type BudgetHealth,
  type BudgetMonthlyStats,
  type BudgetsListInput,
  type BudgetSortInput,
  type CreateBudgetInput,
  type PaginatedBudgets,
  type ServiceResult,
  type UpdateBudgetInput,
} from "@neuralpay/types";
import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import {
  differenceInCalendarDays,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";

function healthFor(percentUsed: number, threshold: number): BudgetHealth {
  if (percentUsed >= 100) return "over";
  if (percentUsed >= threshold) return "warning";
  return "on_track";
}

function invalidateBudgetCache(userId: string) {
  return Promise.all([
    cache.del(cacheKeys.budgets.summary(userId)),
    cache.delPattern(`budgets:stats:${userId}*`),
  ]);
}

async function loadCategories(
  budgetIds: string[],
  userId: string,
  monthStart: Date,
  monthEnd: Date,
): Promise<Map<string, BudgetCategoryDetail[]>> {
  const map = new Map<string, BudgetCategoryDetail[]>();
  if (budgetIds.length === 0) return map;

  const rows = await db
    .select()
    .from(budgetCategories)
    .where(inArray(budgetCategories.budgetId, budgetIds));

  // Compute spend per category per budget
  const spendByCategory = await Promise.all(
    rows.map(async (row) => {
      const [result] = await db
        .select({
          total: sql<string>`coalesce(sum(${transactions.amount}::numeric), 0)::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            eq(transactions.category, row.category),
            gte(transactions.date, monthStart),
            lte(transactions.date, monthEnd),
          ),
        );
      return {
        budgetId: row.budgetId,
        category: row.category,
        limitAmount: row.limitAmount,
        spent: parseFloat(result?.total ?? "0"),
        count: result?.count ?? 0,
      };
    }),
  );

  for (const row of rows) {
    const spend = spendByCategory.find(
      (s) => s.budgetId === row.budgetId && s.category === row.category,
    );
    const limit = parseFloat(row.limitAmount);
    const spent = spend?.spent ?? 0;
    const detail: BudgetCategoryDetail = {
      category: row.category,
      limitAmount: row.limitAmount,
      spent,
      remaining: limit - spent,
      percentUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      transactionCount: spend?.count ?? 0,
    };

    const list = map.get(row.budgetId) ?? [];
    list.push(detail);
    map.set(row.budgetId, list);
  }

  return map;
}

// Load account refs
async function loadAccounts(
  budgetIds: string[],
): Promise<Map<string, BudgetAccountRef[]>> {
  const map = new Map<string, BudgetAccountRef[]>();
  if (budgetIds.length === 0) return map;

  const rows = await db
    .select({
      budgetId: budgetAccounts.budgetId,
      bankAccountId: budgetAccounts.bankAccountId,
      name: bankAccounts.name,
      bankName: bankAccounts.bankName,
      status: bankAccounts.status,
    })
    .from(budgetAccounts)
    .innerJoin(bankAccounts, eq(bankAccounts.id, budgetAccounts.bankAccountId))
    .where(inArray(budgetAccounts.budgetId, budgetIds));

  for (const r of rows) {
    const list = map.get(r.budgetId) ?? [];
    list.push({
      bankAccountId: r.bankAccountId,
      name: r.name,
      bankName: r.bankName,
      isActive: r.status === "active",
    });
    map.set(r.budgetId, list);
  }
  return map;
}

// Enrich raw budget rows
async function enrich(
  userId: string,
  rows: Array<typeof budgets.$inferSelect>,
  month: number,
  year: number,
  sort?: BudgetSortInput,
): Promise<Budget[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  // Determine month scope for spend computation
  const now = new Date();
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const [categoriesMap, accountsMap] = await Promise.all([
    loadCategories(ids, userId, monthStart, monthEnd),
    loadAccounts(ids),
  ]);

  const enriched = rows.map((r) => {
    const cats = categoriesMap.get(r.id) ?? [];
    const totalLimit = parseFloat(r.limitAmount);
    const totalSpent = cats.reduce((sum, c) => sum + c.spent, 0);
    const totalRemaining = totalLimit - totalSpent;
    const totalPercentUsed =
      totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
    const threshold = r.alertThreshold;
    const daysRemaining = differenceInCalendarDays(new Date(r.endDate), now);

    return {
      id: r.id,
      userId: r.userId,
      name: r.name!,
      description: r.description,
      color: r.color,
      limitAmount: r.limitAmount,
      period: r.period as Budget["period"],
      startDate: r.startDate,
      endDate: r.endDate,
      alertThreshold: r.alertThreshold,
      isActive: r.isActive,
      month: r.month,
      year: r.year,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      categories: cats,
      accounts: accountsMap.get(r.id) ?? [],
      totalSpent,
      totalRemaining,
      totalPercentUsed,
      status: healthFor(totalPercentUsed, threshold),
      daysRemaining: Math.max(0, daysRemaining),
      transactionCount: cats.reduce((sum, c) => sum + c.transactionCount, 0),
    };
  });

  // Apply sorting
  if (sort) {
    const dir = sort.direction === "asc" ? 1 : -1;
    enriched.sort((a, b) => {
      switch (sort.field) {
        case "spent":
          return (a.totalSpent - b.totalSpent) * dir;
        case "limitAmount":
          return (parseFloat(a.limitAmount) - parseFloat(b.limitAmount)) * dir;
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "date":
        default:
          return (
            (new Date(b.startDate).getTime() -
              new Date(a.startDate).getTime()) *
            dir
          );
      }
    });
  }

  return enriched;
}

export const BudgetsService = {
  async listByUser(
    userId: string,
    input: BudgetsListInput,
  ): Promise<ServiceResult<PaginatedBudgets>> {
    const now = new Date();
    try {
      const {
        search,
        status,
        isActive,
        period,
        startDate,
        endDate,
        month,
        year,
        cursor,
        limit,
        sortField,
        sortDir,
      } = input;

      const sort: BudgetSortInput = {
        field: sortField ?? "date",
        direction: sortDir ?? "desc",
      };
      const conditions: SQL[] = [eq(budgets.userId, userId)];
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();

      if (isActive !== undefined) {
        conditions.push(eq(budgets.isActive, isActive));
      }

      if (period !== undefined) {
        conditions.push(eq(budgets.period, period));
      }
      if (search) {
        const s = `%${search}%`;
        const searchCond = ilike(budgets.name, s);
        if (searchCond) conditions.push(searchCond);
      }
      if (startDate) conditions.push(gte(budgets.endDate, new Date(startDate)));
      if (endDate) conditions.push(lte(budgets.startDate, new Date(endDate)));

      let query = db
        .select()
        .from(budgets)
        .where(and(...conditions))
        .orderBy(sql`${budgets.createdAt} desc`)
        .limit(limit + 1);

      if (cursor) {
        const cursorId = Buffer.from(cursor, "base64url").toString("utf-8");

        const [cursorRow] = await db
          .select({ id: budgets.id, createdAt: budgets.createdAt })
          .from(budgets)
          .where(and(eq(budgets.id, cursorId), eq(budgets.userId, userId)))
          .limit(1);

        if (cursorRow) {
          const cursorRowCondition = or(
            sql`${budgets.createdAt} < ${cursorRow.createdAt}`,
            and(
              eq(budgets.createdAt, cursorRow.createdAt),
              sql`${budgets.id} < ${cursorRow.id}`,
            ),
          );
          if (cursorRowCondition) conditions.push(cursorRowCondition);
        }
      }

      const rows = await query;
      let enriched = await enrich(userId, rows, targetMonth, targetYear, sort);

      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        enriched = enriched.filter((b) => statuses.includes(b.status));
      }

      const hasMore = enriched.length > limit;
      const items = hasMore ? enriched.slice(0, -1) : enriched;
      const last = items[items.length - 1];
      const nextCursor =
        hasMore && last ? Buffer.from(last.id).toString("base64url") : null;

      return { success: true, data: { items, nextCursor } };
    } catch (err) {
      console.error("[BudgetsService.listByUser]", err);
      return {
        success: false,
        error: "Failed to fetch budgets",
        code: "DB_ERROR",
      };
    }
  },

  async getById(id: string, userId: string): Promise<ServiceResult<Budget>> {
    try {
      const [row] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .limit(1);

      if (!row) {
        return { success: false, error: "Budget not found", code: "NOT_FOUND" };
      }

      const [enriched] = await enrich(userId, [row], row.month, row.year);
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch budget",
        code: "DB_ERROR",
      };
    }
  },

  async getMonthlyStats(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<ServiceResult<BudgetMonthlyStats>> {
    try {
      const now = new Date();
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();
      const monthStart = startOfMonth(new Date(targetYear, targetMonth - 1));
      const monthEnd = endOfMonth(new Date(targetYear, targetMonth - 1));

      const data = await cache.getOrSet(
        cacheKeys.budgets.stats(userId, targetYear, targetMonth),
        async () => {
          const rows = await db
            .select()
            .from(budgets)
            .where(
              and(
                eq(budgets.userId, userId),
                eq(budgets.isActive, true),
                gte(budgets.startDate, monthStart),
                lte(budgets.endDate, monthEnd),
              ),
            );

          const enriched = await enrich(userId, rows, targetMonth, targetYear);

          const totalBudgeted = enriched.reduce(
            (sum, b) => sum + parseFloat(b.limitAmount),
            0,
          );
          const totalSpent = enriched.reduce((sum, b) => sum + b.totalSpent, 0);
          const savingsRate =
            totalBudgeted > 0
              ? Math.round(((totalBudgeted - totalSpent) / totalBudgeted) * 100)
              : 0;

          const onTrackCount = enriched.filter(
            (b) => b.status === "on_track",
          ).length;
          const overCount = enriched.filter((b) => b.status === "over").length;
          const warningCount = enriched.filter(
            (b) => b.status === "warning",
          ).length;

          return {
            currentMonth: format(monthStart, "MMMM yyyy"),
            totalBudgeted,
            totalSpent,
            savingsRate,
            needsAttention: {
              count: warningCount + overCount,
              onTrackCount,
              overBudgetCount: overCount,
            },
          } satisfies BudgetMonthlyStats;
        },
        300, // 5 min cache
      );

      return { success: true, data };
    } catch (err) {
      console.error("[BudgetsService.getMonthlyStats]", err);
      return {
        success: false,
        error: "Failed to fetch stats",
        code: "DB_ERROR",
      };
    }
  },

  async getCalendarData(
    userId: string,
    month: number,
    year: number,
  ): Promise<ServiceResult<BudgetCalendarDay[]>> {
    try {
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));

      const rows = await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, userId),
            gte(budgets.startDate, monthStart),
            lte(budgets.endDate, monthEnd),
          ),
        );

      const enriched = await enrich(userId, rows, month, year);

      // Group by day
      const dayMap = new Map<string, BudgetCalendarDay["budgets"]>();

      for (const budget of enriched) {
        const dayKey = format(budget.startDate, "yyyy-MM-dd");
        const list = dayMap.get(dayKey) ?? [];
        list.push({
          id: budget.id,
          name: budget.name,
          color: budget.color,
          status: budget.status,
          spent: budget.totalSpent,
          limitAmount: budget.limitAmount,
        });
        dayMap.set(dayKey, list);
      }

      // Fill all days of month
      const result: BudgetCalendarDay[] = [];
      const daysInMonth = monthEnd.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const key = format(date, "yyyy-MM-dd");
        result.push({
          date: key,
          budgets: dayMap.get(key) ?? [],
        });
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("[BudgetsService.getCalendarData]", err);
      return {
        success: false,
        error: "Failed to fetch calendar",
        code: "DB_ERROR",
      };
    }
  },

  async create(
    userId: string,
    input: CreateBudgetInput,
  ): Promise<ServiceResult<Budget>> {
    try {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      // Sanitize optional fields before persisting.
      const accountIds = input.accountIds ?? [];

      const [created] = await db
        .insert(budgets)
        .values({
          userId,
          name: input.name,
          description: input.description ?? null,
          color: input.color ?? "#6366f1",
          limitAmount: input.limitAmount.toString(),
          period: input.period ?? "monthly",
          startDate: start,
          endDate: end,
          month: start.getMonth() + 1,
          year: start.getFullYear(),
          alertThreshold: input.alertThreshold ?? 80,
          isActive: true,
        })
        .returning();

      if (!created) throw new Error("Insert returned no row");

      // Insert category allocations
      if (input.categories.length > 0) {
        await db.insert(budgetCategories).values(
          input.categories.map((c) => ({
            budgetId: created.id,
            category: c.category,
            limitAmount: c.limitAmount.toString(),
          })),
        );
      }

      // Link accounts
      if (accountIds.length > 0) {
        const owned = await db
          .select({ id: bankAccounts.id })
          .from(bankAccounts)
          .where(
            and(
              eq(bankAccounts.userId, userId),
              inArray(bankAccounts.id, accountIds),
            ),
          );
        if (owned.length > 0) {
          await db
            .insert(budgetAccounts)
            .values(
              owned.map((a) => ({ budgetId: created.id, bankAccountId: a.id })),
            );
        }
      }

      await invalidateBudgetCache(userId);
      const [enriched] = await enrich(
        userId,
        [created],
        created.month,
        created.year,
      );
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.create]", err);
      return {
        success: false,
        error: "Failed to create budget",
        code: "DB_ERROR",
      };
    }
  },

  async update(
    userId: string,
    input: UpdateBudgetInput,
  ): Promise<ServiceResult<Budget>> {
    try {
      const [existing] = await db
        .select({ id: budgets.id })
        .from(budgets)
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, userId)))
        .limit(1);

      if (!existing) {
        return { success: false, error: "Budget not found", code: "NOT_FOUND" };
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.limitAmount !== undefined)
        updateData.limitAmount = input.limitAmount.toString();
      if (input.period !== undefined) updateData.period = input.period;
      if (input.alertThreshold !== undefined)
        updateData.alertThreshold = input.alertThreshold;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      if (input.startDate !== undefined) {
        const start = new Date(input.startDate);
        updateData.startDate = start;
        updateData.month = start.getMonth() + 1;
        updateData.year = start.getFullYear();
      }
      if (input.endDate !== undefined) {
        updateData.endDate = new Date(input.endDate);
      }

      const [updated] = await db
        .update(budgets)
        .set(updateData)
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, userId)))
        .returning();

      if (!updated) {
        return { success: false, error: "Budget not found", code: "NOT_FOUND" };
      }

      // Replace categories
      if (input.categories !== undefined) {
        await db
          .delete(budgetCategories)
          .where(eq(budgetCategories.budgetId, input.id));
        if (input.categories.length > 0) {
          await db.insert(budgetCategories).values(
            input.categories.map((c) => ({
              budgetId: input.id,
              category: c.category,
              limitAmount: c.limitAmount.toString(),
            })),
          );
        }
      }

      // Replace accounts
      if (input.accountIds !== undefined) {
        await db
          .delete(budgetAccounts)
          .where(eq(budgetAccounts.budgetId, input.id));
        if (input.accountIds.length > 0) {
          const owned = await db
            .select({ id: bankAccounts.id })
            .from(bankAccounts)
            .where(
              and(
                eq(bankAccounts.userId, userId),
                inArray(bankAccounts.id, input.accountIds),
              ),
            );
          if (owned.length > 0) {
            await db
              .insert(budgetAccounts)
              .values(
                owned.map((a) => ({ budgetId: input.id, bankAccountId: a.id })),
              );
          }
        }
      }

      await invalidateBudgetCache(userId);
      const [enriched] = await enrich(
        userId,
        [updated],
        updated.month,
        updated.year,
      );
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.update]", err);
      return {
        success: false,
        error: "Failed to update budget",
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
        .delete(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .returning({ id: budgets.id });

      if (!deleted) {
        return { success: false, error: "Budget not found", code: "NOT_FOUND" };
      }

      await invalidateBudgetCache(userId);
      return { success: true, data: { id: deleted.id } };
    } catch (err) {
      console.error("[BudgetsService.delete]", err);
      return {
        success: false,
        error: "Failed to delete budget",
        code: "DB_ERROR",
      };
    }
  },

  async deleteMany(
  ids: string[],
  userId: string,
): Promise<ServiceResult<{ deleted: number; failed: string[] }>> {
  try {
    const failed: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      const result = await this.delete(id, userId);
      if (result.success) {
        deleted++;
      } else {
        failed.push(id);
      }
    }

    if (failed.length > 0 && deleted === 0) {
      return {
        success: false,
        error: `Failed to delete all ${ids.length} budgets`,
        code: "DB_ERROR",
      };
    }

    return { success: true, data: { deleted, failed } };
  } catch (err) {
    console.error("[BudgetsService.deleteMany]", err);
    return {
      success: false,
      error: "Failed to delete budgets",
      code: "DB_ERROR",
    };
  }
}
} as const;
