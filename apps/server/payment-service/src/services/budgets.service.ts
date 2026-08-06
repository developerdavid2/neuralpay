import { cache, cacheKeys } from "@neuralpay/redis";
import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgetAccounts,
  budgets,
  transactions,
} from "@neuralpay/db/schema";
import {
  type Budget,
  type BudgetAccountRef,
  type BudgetHealth,
  type BudgetsFilterInput,
  type BudgetSummary,
  type CreateBudgetInput,
  type ServiceResult,
  type UpdateBudgetInput,
} from "@neuralpay/types";
import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { differenceInCalendarDays } from "date-fns";

async function invalidateBudgetCache(userId: string) {
  await cache.del(cacheKeys.budgets.summary(userId)).catch(() => {});
}

function healthFor(percentUsed: number, threshold: number): BudgetHealth {
  if (percentUsed >= 100) return "over";
  if (percentUsed >= threshold) return "warning";
  return "on_track";
}

// Sum matching debit transactions for a set of budgets in one query,
// keyed by budgetId. Account scoping is applied per budget afterwards.
async function computeSpendForBudgets(
  userId: string,
  rows: Array<{
    id: string;
    category: Budget["category"];
    startDate: Date | null;
    endDate: Date | null;
    accountIds: string[];
  }>,
): Promise<Map<string, { spent: number; count: number }>> {
  const result = new Map<string, { spent: number; count: number }>();
  if (rows.length === 0) return result;

  await Promise.all(
    rows.map(async (b) => {
      const conditions: SQL[] = [
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        eq(transactions.category, b.category),
      ];
      if (b.startDate) conditions.push(gte(transactions.date, b.startDate));
      if (b.endDate) conditions.push(lte(transactions.date, b.endDate));
      if (b.accountIds.length > 0) {
        conditions.push(inArray(transactions.bankAccountId, b.accountIds));
      }

      const [row] = await db
        .select({
          total: sql<string>`coalesce(sum(${transactions.amount}::numeric), 0)::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(transactions)
        .where(and(...conditions));

      result.set(b.id, {
        spent: parseFloat(row?.total ?? "0"),
        count: row?.count ?? 0,
      });
    }),
  );

  return result;
}
// Load account refs for a set of budgets, grouped by budgetId.
async function loadAccountRefs(
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
    })
    .from(budgetAccounts)
    .innerJoin(
      bankAccounts,
      eq(bankAccounts.id, budgetAccounts.bankAccountId),
    )
    .where(inArray(budgetAccounts.budgetId, budgetIds));

  for (const r of rows) {
    const list = map.get(r.budgetId) ?? [];
    list.push({
      bankAccountId: r.bankAccountId,
      name: r.name,
      bankName: r.bankName,
    });
    map.set(r.budgetId, list);
  }
  return map;
}

// Enrich raw budget rows with account refs + derived spend metrics.
async function enrich(
  userId: string,
  rows: Array<typeof budgets.$inferSelect>,
): Promise<Budget[]> {
  if (rows.length === 0) return [];

  const accountsMap = await loadAccountRefs(rows.map((r) => r.id));

  const spendInput = rows.map((r) => ({
    id: r.id,
    category: r.category,
    startDate: r.startDate,
    endDate: r.endDate,
    accountIds: (accountsMap.get(r.id) ?? []).map((a) => a.bankAccountId),
  }));
  const spendMap = await computeSpendForBudgets(userId, spendInput);

  const now = new Date();

  return rows.map((r) => {
    const limit = parseFloat(r.limitAmount ?? "0");
    const spend = spendMap.get(r.id) ?? { spent: 0, count: 0 };
    const percentUsed =
      limit > 0 ? Math.round((spend.spent / limit) * 100) : 0;
    const threshold = r.alertThreshold ?? 80;
    const daysRemaining = r.endDate
      ? Math.max(0, differenceInCalendarDays(r.endDate, now))
      : 0;

    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      description: r.description,
      category: r.category,
      color: r.color,
      limitAmount: r.limitAmount,
      month: r.month,
      year: r.year,
      alertThreshold: r.alertThreshold,
      startDate: r.startDate,
      endDate: r.endDate,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      accounts: accountsMap.get(r.id) ?? [],
      spent: spend.spent,
      remaining: limit - spend.spent,
      percentUsed,
      status: healthFor(percentUsed, threshold),
      daysRemaining,
      transactionCount: spend.count,
    } satisfies Budget;
  });
}
export const BudgetsService = {
  async listByUser(
    userId: string,
    input: BudgetsFilterInput,
  ): Promise<ServiceResult<Budget[]>> {
    try {
      const { search, category, isActive, from, to } = input;
      const conditions: SQL[] = [eq(budgets.userId, userId)];

      if (typeof isActive === "boolean") {
        conditions.push(eq(budgets.isActive, isActive));
      }
      if (category) {
        const cats = Array.isArray(category) ? category : [category];
        if (cats.length > 0) {
          conditions.push(inArray(budgets.category, cats));
        }
      }
      if (search) {
        conditions.push(sql`${budgets.name} ilike ${`%${search}%`}`);
      }
      // Range overlap: budget.start <= to AND budget.end >= from
      if (to) conditions.push(lte(budgets.startDate, new Date(to)));
      if (from) conditions.push(gte(budgets.endDate, new Date(from)));

      const rows = await db
        .select()
        .from(budgets)
        .where(and(...conditions))
        .orderBy(sql`${budgets.startDate} desc nulls last`, budgets.createdAt);

      const data = await enrich(userId, rows);
      return { success: true, data };
    } catch (err) {
      console.error("[BudgetsService.listByUser]", err);
      return { success: false, error: "Failed to fetch budgets", code: "DB_ERROR" };
    }
  },

  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<Budget>> {
    try {
      const [row] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .limit(1);

      if (!row) {
        return { success: false, error: "Budget not found", code: "NOT_FOUND" };
      }

      const [enriched] = await enrich(userId, [row]);
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.getById]", err);
      return { success: false, error: "Failed to fetch budget", code: "DB_ERROR" };
    }
  },

  async getSummary(
    userId: string,
  ): Promise<ServiceResult<BudgetSummary>> {
    try {
      const data = await cache.getOrSet(
        cacheKeys.budgets.summary(userId),
        async () => {
          const rows = await db
            .select()
            .from(budgets)
            .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)));
          const enriched = await enrich(userId, rows);

          return enriched.reduce<BudgetSummary>(
            (acc, b) => {
              acc.totalBudgeted += parseFloat(b.limitAmount ?? "0");
              acc.totalSpent += b.spent;
              acc.totalRemaining += b.remaining;
              acc.activeCount += 1;
              if (b.status === "over") acc.overCount += 1;
              else if (b.status === "warning") acc.warningCount += 1;
              return acc;
            },
            {
              totalBudgeted: 0,
              totalSpent: 0,
              totalRemaining: 0,
              activeCount: 0,
              overCount: 0,
              warningCount: 0,
            },
          );
        },
        120,
      );
      return { success: true, data };
    } catch (err) {
      console.error("[BudgetsService.getSummary]", err);
      return { success: false, error: "Failed to fetch summary", code: "DB_ERROR" };
    }
  },
  async create(
    userId: string,
    input: CreateBudgetInput,
  ): Promise<ServiceResult<Budget>> {
    try {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const [created] = await db
        .insert(budgets)
        .values({
          userId,
          name: input.name,
          description: input.description ?? null,
          category: input.category,
          color: input.color ?? null,
          limitAmount: input.limitAmount.toString(),
          // Derive legacy period columns from the start date so
          // getSpendingOverview continues to see this budget.
          month: start.getMonth() + 1,
          year: start.getFullYear(),
          alertThreshold: input.alertThreshold ?? 80,
          startDate: start,
          endDate: end,
          isActive: true,
        })
        .returning();

      if (!created) throw new Error("Insert returned no row");

      const accountIds = input.accountIds ?? [];
      if (accountIds.length > 0) {
        // Only link accounts that belong to this user.
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
          await db.insert(budgetAccounts).values(
            owned.map((a) => ({ budgetId: created.id, bankAccountId: a.id })),
          );
        }
      }

      await invalidateBudgetCache(userId);
      const [enriched] = await enrich(userId, [created]);
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.create]", err);
      return { success: false, error: "Failed to create budget", code: "DB_ERROR" };
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
      if (input.category !== undefined) updateData.category = input.category;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.limitAmount !== undefined)
        updateData.limitAmount = input.limitAmount.toString();
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

      // Replace account links when accountIds is provided.
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
            await db.insert(budgetAccounts).values(
              owned.map((a) => ({ budgetId: input.id, bankAccountId: a.id })),
            );
          }
        }
      }

      await invalidateBudgetCache(userId);
      const [enriched] = await enrich(userId, [updated]);
      return { success: true, data: enriched! };
    } catch (err) {
      console.error("[BudgetsService.update]", err);
      return { success: false, error: "Failed to update budget", code: "DB_ERROR" };
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
      return { success: false, error: "Failed to delete budget", code: "DB_ERROR" };
    }
  },
} as const;
