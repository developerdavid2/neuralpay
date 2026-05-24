import { db } from "@neuralpay/db";
import type { BankAccountRecord } from "@neuralpay/db/schema";
import { bankAccounts } from "@neuralpay/db/schema";
import {
  type CreateAccountInput,
  type ServiceResult,
  type UpdateAccountInput,
} from "@neuralpay/types";
import { and, eq } from "drizzle-orm";

export const AccountsService = {
  async listByUser(
    userId: string,
  ): Promise<ServiceResult<BankAccountRecord[]>> {
    try {
      const rows = await db
        .select()
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        )
        .orderBy(bankAccounts.createdAt);
      return { success: true, data: rows };
    } catch (err) {
      console.error("[AccountsService.listByUser]", err);
      return {
        success: false,
        error: "Failed to fetch accounts",
        code: "DB_ERROR",
      };
    }
  },

  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<BankAccountRecord>> {
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
      return { success: true, data: row };
    } catch (err) {
      console.error("[AccountsService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch account",
        code: "DB_ERROR",
      };
    }
  },

  async create(
    userId: string,
    input: CreateAccountInput,
  ): Promise<ServiceResult<BankAccountRecord>> {
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
      return { success: true, data: created! };
    } catch (err) {
      console.error("[AccountsService.create]", err);
      return {
        success: false,
        error: "Failed to create account",
        code: "DB_ERROR",
      };
    }
  },

  async update(
    userId: string,
    input: UpdateAccountInput,
  ): Promise<ServiceResult<BankAccountRecord>> {
    try {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updateData.name = input.name;
      if (input.subtype !== undefined) updateData.subtype = input.subtype;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.bankName !== undefined) updateData.bankName = input.bankName;
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
      return { success: true, data: updated };
    } catch (err) {
      console.error("[AccountsService.update]", err);
      return {
        success: false,
        error: "Failed to update account",
        code: "DB_ERROR",
      };
    }
  },

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
} as const;
