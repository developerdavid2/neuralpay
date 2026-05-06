import { db } from "@neuralpay/db";
import { bankAccounts, type AccountRecord } from "@neuralpay/db/schema";
import type { ServiceResult } from "@neuralpay/types";
import { eq, and } from "drizzle-orm";

export const AccountsService = {
  async listByUser(userId: string): Promise<ServiceResult<AccountRecord[]>> {
    try {
      const result = await db
        .select()
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        )
        .orderBy(bankAccounts.createdAt);

      return { success: true, data: result };
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
  ): Promise<ServiceResult<AccountRecord>> {
    try {
      const result = await db
        .select()
        .from(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .limit(1);

      if (!result[0]) {
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: result[0] };
    } catch (err) {
      console.error("[AccountsService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch account",
        code: "DB_ERROR",
      };
    }
  },

  // Aggregates total balance across all active accounts in USD
  async getTotalBalance(userId: string): Promise<
    ServiceResult<{
      totalBalance: number;
      accountCount: number;
    }>
  > {
    try {
      const accounts = await db
        .select({ balance: bankAccounts.balance })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        );

      const totalBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance ?? "0"),
        0,
      );

      return {
        success: true,
        data: { totalBalance, accountCount: accounts.length },
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

  async disconnect(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const result = await db
        .update(bankAccounts)
        .set({ status: "disconnected", updatedAt: new Date() })
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
        .returning({ id: bankAccounts.id });

      if (!result[0]) {
        return {
          success: false,
          error: "Account not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: { id: result[0].id } };
    } catch (err) {
      console.error("[AccountsService.disconnect]", err);
      return {
        success: false,
        error: "Failed to disconnect account",
        code: "DB_ERROR",
      };
    }
  },
} as const;
