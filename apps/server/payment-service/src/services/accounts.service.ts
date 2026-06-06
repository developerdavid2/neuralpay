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
  // ── LIST (cursor-paginated, filterable)
  async listByUser(
    userId: string,
    input: AccountsFilterInput,
  ): Promise<ServiceResult<PaginatedAccounts>> {
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
        if (statuses.length > 0 && statuses.length < ACCOUNT_STATUSES.length) {
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

  // server/services/accounts.service.ts
  async listAllByUser(
    userId: string,
    input: AccountsListAllInput,
  ): Promise<ServiceResult<BankAccount[]>> {
    try {
      const { search, type, status, tags, isManual } = input;

      const conditions = [eq(bankAccounts.userId, userId)];

      if (type?.length) {
        conditions.push(
          inArray(bankAccounts.type, type as (typeof ACCOUNT_TYPES)[number][]),
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
  // ── GET BY ID
  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<BankAccount>> {
    try {
      const [row] = await db
        .select()
        .from(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
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

  // ── CREATE
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
          subtype: input.subtype ?? null,
          tags: input.tags,
          bankName: input.bankName ?? null,
          maskedNumber: input.maskedNumber ?? null,
          balance: input.balance.toString(),
          currency: input.currency,
          isManual: true,
          status: "active",
        })
        .returning();

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

  // ── UPDATE
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

  // ── DISCONNECT (soft-delete for synced accounts)
  async disconnect(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [updated] = await db
        .update(bankAccounts)
        .set({ status: "disconnected", updatedAt: new Date() })
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .returning({ id: bankAccounts.id });

      if (!updated)
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };
      return { success: true, data: { id: updated.id } };
    } catch (err) {
      console.error("[AccountsService.disconnect]", err);
      return {
        success: false,
        error: "Failed to disconnect account",
        code: "DB_ERROR",
      };
    }
  },

  // ── DELETE (hard delete — manual accounts only)
  async delete(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      // Only allow deleting manual accounts
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

  // ── GET TOTAL BALANCE
  async getTotalBalance(
    userId: string,
  ): Promise<ServiceResult<{ totalBalance: number; accountCount: number }>> {
    try {
      const rows = await db
        .select({ balance: bankAccounts.balance })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        );

      const totalBalance = rows.reduce(
        (sum, r) => sum + parseFloat(r.balance ?? "0"),
        0,
      );

      return {
        success: true,
        data: { totalBalance, accountCount: rows.length },
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

  // ── GET AGGREGATED BALANCE BY TYPE (for stats cards)
  async getAggregateBalanceByType(userId: string): Promise<
    ServiceResult<
      Array<{
        type: string;
        totalBalance: number;
        accountCount: number;
      }>
    >
  > {
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
} as const;
