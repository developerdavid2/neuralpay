import { db } from "@neuralpay/db";
import { bankAccounts } from "@neuralpay/db/schema";
import {
  ACCOUNT_STATUSES,
  ACCOUNT_TYPES,
  type AccountsFilterInput,
  type AccountsListAllInput,
  type BankAccount,
  type CreateAccountInput,
  type PaginatedAccounts,
  type ServiceResult,
  type UpdateAccountInput,
} from "@neuralpay/types";
import { cache, cacheKeys } from "@neuralpay/cache";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";

export const AccountsService = {
  // ── LIST (paginated, filterable) — cached per user + filter fingerprint
  async listByUser(
    userId: string,
    input: AccountsFilterInput,
  ): Promise<ServiceResult<PaginatedAccounts>> {
    const cacheKey = cacheKeys.accounts.list(
      userId,
      JSON.stringify({
        page: input.page,
        limit: input.limit,
        search: input.search,
        type: input.type,
        status: input.status,
        tags: input.tags,
      }),
    );

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const { limit, search, type, status, tags } = input;

          const conditions = [eq(bankAccounts.userId, userId)];

          if (type) {
            const types = Array.isArray(type) ? type : [type];
            if (types.length > 0 && types.length < ACCOUNT_TYPES.length) {
              conditions.push(
                inArray(
                  bankAccounts.type,
                  types as (typeof ACCOUNT_TYPES)[number][],
                ),
              );
            }
          }
          if (status) {
            const statuses = Array.isArray(status) ? status : [status];
            if (
              statuses.length > 0 &&
              statuses.length < ACCOUNT_STATUSES.length
            ) {
              conditions.push(
                inArray(
                  bankAccounts.status,
                  statuses as (typeof ACCOUNT_STATUSES)[number][],
                ),
              );
            }
          }

          if (tags?.length) {
            conditions.push(sql`${bankAccounts.tags} && ${tags}`);
          }

          if (search) {
            const s = `%${search}%`;
            const searchCond = or(
              ilike(bankAccounts.name, s),
              ilike(bankAccounts.bankName, s),
              ilike(bankAccounts.maskedNumber, s),
            );
            if (searchCond) conditions.push(searchCond);
          }

          const page = input.page ?? 1;
          const offset = (page - 1) * limit;

          const [rows, countRows] = await Promise.all([
            db
              .select(getTableColumns(bankAccounts))
              .from(bankAccounts)
              .where(and(...conditions))
              .orderBy(desc(bankAccounts.createdAt), desc(bankAccounts.id))
              .limit(limit)
              .offset(offset),
            db
              .select({ count: sql<number>`count(*)::int` })
              .from(bankAccounts)
              .where(and(...conditions)),
          ]);

          const totalCount = countRows[0]?.count ?? 0;
          const pageCount = Math.ceil(totalCount / limit);

          return {
            success: true,
            data: {
              items: rows as BankAccount[],
              totalCount,
              pageCount,
            },
          };
        } catch (err) {
          console.error("[AccountsService.listByUser]", err);
          return {
            success: false,
            error: "Failed to fetch accounts",
            code: "DB_ERROR",
          };
        }
      },
      60, // 1 min TTL for paginated lists
    );
  },

  // ── LIST ALL (no pagination) — used in dropdowns, filters
  // FIX: cache key now includes a filter fingerprint so different filter
  // combinations don't collide on the same cached result.
  async listAllByUser(
    userId: string,
    input: AccountsListAllInput,
  ): Promise<ServiceResult<BankAccount[]>> {
    const cacheKey = cacheKeys.accounts.listAll(
      userId,
      JSON.stringify({
        search: input.search,
        type: input.type,
        status: input.status,
        tags: input.tags,
        isManual: input.isManual,
      }),
    );

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const { search, type, status, tags, isManual } = input;

          const conditions = [eq(bankAccounts.userId, userId)];

          if (type?.length) {
            conditions.push(
              inArray(
                bankAccounts.type,
                type as (typeof ACCOUNT_TYPES)[number][],
              ),
            );
          }
          if (status?.length) {
            conditions.push(
              inArray(
                bankAccounts.status,
                status as (typeof ACCOUNT_STATUSES)[number][],
              ),
            );
          }
          if (tags?.length) {
            conditions.push(sql`${bankAccounts.tags} && ${tags}`);
          }
          if (isManual !== undefined) {
            conditions.push(eq(bankAccounts.isManual, isManual));
          }
          if (search) {
            const s = `%${search}%`;
            const searchCond = or(
              ilike(bankAccounts.name, s),
              ilike(bankAccounts.bankName, s),
              ilike(bankAccounts.maskedNumber, s),
            );
            if (searchCond) conditions.push(searchCond);
          }

          const rows = await db
            .select(getTableColumns(bankAccounts))
            .from(bankAccounts)
            .where(and(...conditions))
            .orderBy(desc(bankAccounts.createdAt));

          return {
            success: true,
            data: rows as BankAccount[],
          };
        } catch (err) {
          console.error("[AccountsService.listAllByUser]", err);
          return {
            success: false,
            error: "Failed to fetch accounts",
            code: "DB_ERROR",
          };
        }
      },
      300, // 5 min TTL for listAll
    );
  },

  // ── GET BY ID — cached per account + user
  // FIX: cache key now includes userId so one user's cached result can never
  // be served to a different user making the same account id request.
  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<BankAccount>> {
    const cacheKey = cacheKeys.accounts.byId(id, userId);
    console.log("[AccountService.getById]", { cacheKey });

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const [row] = await db
            .select()
            .from(bankAccounts)
            .where(
              and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)),
            )
            .limit(1);

          if (!row)
            return {
              success: false,
              error: "Account not found",
              code: "NOT_FOUND",
            };
          return { success: true, data: row as BankAccount };
        } catch (err) {
          console.error("[AccountsService.getById]", err);
          return {
            success: false,
            error: "Failed to fetch account",
            code: "DB_ERROR",
          };
        }
      },
      300, // 5 min TTL
    );
  },

  // ── CREATE — invalidate user account caches
  async create(
    userId: string,
    input: CreateAccountInput,
  ): Promise<ServiceResult<BankAccount>> {
    try {
      const [created] = await db
        .insert(bankAccounts)
        .values({
          userId,
          name: input.name,
          type: input.type,
          subtype: input.subtype,
          tags: input.tags,
          bankName: input.bankName,
          maskedNumber: input.maskedNumber,
          balance: input.balance.toString(),
          currency: input.currency,
          isManual: true,
          status: "active",
        })
        .returning();

      await cache.delPattern(`accounts:*:${userId}*`);
      await cache.del(cacheKeys.accounts.totalBalance(userId));
      await cache.del(cacheKeys.accounts.aggregate(userId));

      return { success: true, data: created! as BankAccount };
    } catch (err) {
      console.error("[AccountsService.create]", err);
      return {
        success: false,
        error: "Failed to create account",
        code: "DB_ERROR",
      };
    }
  },

  // ── UPDATE — invalidate specific + user caches
  async update(
    userId: string,
    input: UpdateAccountInput,
  ): Promise<ServiceResult<BankAccount>> {
    try {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.subtype !== undefined) updateData.subtype = input.subtype;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.bankName !== undefined) updateData.bankName = input.bankName;
      if (input.maskedNumber !== undefined)
        updateData.maskedNumber = input.maskedNumber;
      if (input.balance !== undefined)
        updateData.balance = input.balance.toString();
      if (input.currency !== undefined) updateData.currency = input.currency;

      const [updated] = await db
        .update(bankAccounts)
        .set(updateData)
        .where(
          and(eq(bankAccounts.id, input.id), eq(bankAccounts.userId, userId)),
        )
        .returning();

      if (!updated)
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };

      await cache.del(cacheKeys.accounts.byId(input.id, userId));
      await cache.delPattern(`accounts:*:${userId}*`);
      await cache.del(cacheKeys.accounts.totalBalance(userId));
      await cache.del(cacheKeys.accounts.aggregate(userId));

      return { success: true, data: updated as BankAccount };
    } catch (err) {
      console.error("[AccountsService.update]", err);
      return {
        success: false,
        error: "Failed to update account",
        code: "DB_ERROR",
      };
    }
  },

  // ── TOGGLE STATUS — for synced accounts only
  // FIX: prefetch the account first so we can return FORBIDDEN (not NOT_FOUND)
  // when someone tries to toggle a manual account's status.
  async toggleStatus(
    id: string,
    userId: string,
    status: "active" | "inactive",
  ): Promise<ServiceResult<BankAccount>> {
    try {
      const [account] = await db
        .select({ isManual: bankAccounts.isManual })
        .from(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .limit(1);

      if (!account)
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };

      if (account.isManual)
        return {
          success: false,
          error:
            "Manual accounts cannot have their status toggled. Edit the account directly.",
          code: "FORBIDDEN",
        };

      const [updated] = await db
        .update(bankAccounts)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .returning();

      if (!updated)
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };

      await cache.del(cacheKeys.accounts.byId(id, userId));
      await cache.delPattern(`accounts:*:${userId}*`);
      await cache.del(cacheKeys.accounts.totalBalance(userId));
      await cache.del(cacheKeys.accounts.aggregate(userId));

      return { success: true, data: updated as BankAccount };
    } catch (err) {
      console.error("[AccountsService.toggleStatus]", err);
      return {
        success: false,
        error: "Failed to toggle account",
        code: "DB_ERROR",
      };
    }
  },

  // ── DELETE — hard delete manual accounts only
  async delete(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [account] = await db
        .select({ isManual: bankAccounts.isManual })
        .from(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .limit(1);

      if (!account)
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };

      if (!account.isManual) {
        return {
          success: false,
          error: "Synced accounts cannot be deleted. Disconnect instead.",
          code: "FORBIDDEN",
        };
      }

      const [deleted] = await db
        .delete(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .returning({ id: bankAccounts.id });

      await cache.del(cacheKeys.accounts.byId(id, userId));
      await cache.delPattern(`accounts:*:${userId}*`);
      await cache.del(cacheKeys.accounts.totalBalance(userId));
      await cache.del(cacheKeys.accounts.aggregate(userId));

      return { success: true, data: { id: deleted!.id } };
    } catch (err) {
      console.error("[AccountsService.delete]", err);
      return {
        success: false,
        error: "Failed to delete account",
        code: "DB_ERROR",
      };
    }
  },

  // ── GET TOTAL BALANCE — SQL aggregate, cached
  // FIX: sum computed in SQL instead of fetching all rows and summing in JS.
  async getTotalBalance(
    userId: string,
  ): Promise<ServiceResult<{ totalBalance: number; accountCount: number }>> {
    const cacheKey = cacheKeys.accounts.totalBalance(userId);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const [row] = await db
            .select({
              totalBalance: sql<number>`coalesce(sum(${bankAccounts.balance}::numeric), 0)::float`,
              accountCount: sql<number>`count(*)::int`,
            })
            .from(bankAccounts)
            .where(
              and(
                eq(bankAccounts.userId, userId),
                eq(bankAccounts.status, "active"),
              ),
            );

          return {
            success: true,
            data: {
              totalBalance: Number(row?.totalBalance) || 0,
              accountCount: row?.accountCount ?? 0,
            },
          };
        } catch (err) {
          console.error("[AccountsService.getTotalBalance]", err);
          return {
            success: false,
            error: "Failed to aggregate balances",
            code: "DB_ERROR",
          };
        }
      },
      300, // 5 min TTL
    );
  },

  // ── GET AGGREGATED BALANCE BY TYPE — cached
  async getAggregateBalanceByType(userId: string): Promise<
    ServiceResult<
      Array<{
        type: string;
        totalBalance: number;
        accountCount: number;
      }>
    >
  > {
    const cacheKey = cacheKeys.accounts.aggregate(userId);

    return cache.getOrSet(
      cacheKey,
      async () => {
        try {
          const result = await db
            .select({
              type: bankAccounts.type,
              totalBalance: sql<number>`sum(${bankAccounts.balance}::numeric)::float`,
              accountCount: sql<number>`count(*)::int`,
            })
            .from(bankAccounts)
            .where(
              and(
                eq(bankAccounts.userId, userId),
                eq(bankAccounts.status, "active"),
              ),
            )
            .groupBy(bankAccounts.type);

          return {
            success: true,
            data: result.map((r) => ({
              type: r.type,
              totalBalance: Number(r.totalBalance) || 0,
              accountCount: r.accountCount,
            })),
          };
        } catch (err) {
          console.error("[AccountsService.getBalanceByType]", err);
          return {
            success: false,
            error: "Failed to aggregate balances by type",
            code: "DB_ERROR",
          };
        }
      },
      300, // 5 min TTL
    );
  },
} as const;
