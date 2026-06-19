import { db } from "@neuralpay/db";
import {
  bankAccounts,
  connectedBanks,
  transactions,
} from "@neuralpay/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { CountryCode, Products } from "plaid";
import { plaidClient } from "../lib/plaidClient";
import { mapPlaidCategoryToEnum } from "../lib/plaidCategoryMap";
import { TRPCError } from "@trpc/server";
import type {
  AccountType,
  TransactionStatus,
  TransactionType,
} from "@neuralpay/types";

export const PlaidService = {
  async getConnectedBank(userId: string) {
    const [bank] = await db
      .select()
      .from(connectedBanks)
      .where(eq(connectedBanks.userId, userId));
    return bank ?? null;
  },

  async disconnectBank(userId: string) {
    const [deleted] = await db
      .delete(connectedBanks)
      .where(eq(connectedBanks.userId, userId))
      .returning({ id: connectedBanks.id });

    if (!deleted) return null;

    await db
      .update(bankAccounts)
      .set({ status: "disconnected", updatedAt: new Date() })
      .where(
        and(
          eq(bankAccounts.userId, userId),
          isNotNull(bankAccounts.plaidItemId),
        ),
      );

    return deleted;
  },

  async createLinkToken(userId: string) {
    const token = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "NeuralPay",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return token.data.link_token;
  },

  async exchangePublicToken(userId: string, publicToken: string) {
    const exchange = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchange.data.access_token;
    const itemId = exchange.data.item_id;

    // Resolve institution name
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });
    const institutionId = itemResponse.data.item.institution_id;

    let institutionName: string | null = null;
    if (institutionId) {
      const instResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = instResponse.data.institution.name;
    }

    // Persist the connection
    await db.insert(connectedBanks).values({
      id: createId(),
      userId,
      accessToken,
      itemId,
      institutionId,
      institutionName,
    });

    // Initial data sync
    await this.syncTransactions(userId, accessToken, itemId, institutionName);

    return { success: true };
  },

  async syncTransactions(
    userId: string,
    accessToken: string,
    itemId: string,
    institutionName: string | null,
  ) {
    // ── 1. Fetch accounts
    const plaidAccounts = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // ── 2. Upsert accounts
    const accountMap = new Map<string, string>();

    for (const acc of plaidAccounts.data.accounts) {
      const [existing] = await db
        .select({ id: bankAccounts.id })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.plaidAccountId, acc.account_id),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(bankAccounts)
          .set({
            balance: (acc.balances.current ?? 0).toString(),
            bankName: institutionName ?? undefined,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bankAccounts.id, existing.id));

        accountMap.set(acc.account_id, existing.id);
      } else {
        const [newAcc] = await db
          .insert(bankAccounts)
          .values({
            id: createId(),
            userId,
            name: acc.name,
            type: mapPlaidAccountType(acc.type),
            subtype: acc.subtype ?? null,
            bankName: institutionName,
            balance: (acc.balances.current ?? 0).toString(),
            currency: acc.balances.iso_currency_code ?? "USD",
            isManual: false,
            status: "active",
            plaidItemId: itemId,
            plaidAccountId: acc.account_id,
            lastSyncedAt: new Date(),
          })
          .returning({ id: bankAccounts.id });

        if (!newAcc) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create bank account record",
          });
        }

        accountMap.set(acc.account_id, newAcc.id);
      }
    }

    const added: Awaited<
      ReturnType<typeof plaidClient.transactionsSync>
    >["data"]["added"] = [];
    const modified: Awaited<
      ReturnType<typeof plaidClient.transactionsSync>
    >["data"]["modified"] = [];
    const removedIds: string[] = [];

    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
        },
        ...(cursor ? { cursor } : {}),
      });

      added.push(...response.data.added);
      modified.push(...response.data.modified);

      hasMore = response.data.has_more;
      cursor = response.data.next_cursor;
    }

    // ── 4. Insert added transactions
    const txToInsert = added
      .filter((tx) => accountMap.has(tx.account_id))
      .map((tx) => {
        const isDebit = tx.amount >= 0;

        return {
          id: createId(),
          userId,
          bankAccountId: accountMap.get(tx.account_id)!,
          description: tx.name,
          amount: Math.abs(tx.amount).toString(),
          // Cast to literal union to satisfy Drizzle's enum type
          type: (isDebit ? "debit" : "credit") as TransactionType,
          status: "successful" as TransactionStatus,
          // PFC replaces the deprecated category_id / categoriesGet() approach
          category: mapPlaidCategoryToEnum(
            tx.personal_finance_category?.primary,
            tx.personal_finance_category?.detailed,
          ),
          merchant: tx.merchant_name ?? tx.name,
          date: new Date(tx.date),
          isManual: false,
          plaidTxId: tx.transaction_id,
        };
      });

    if (txToInsert.length > 0) {
      await db.insert(transactions).values(txToInsert);
    }

    // ── 5. Update modified transactions
    for (const tx of modified) {
      if (!accountMap.has(tx.account_id)) continue;

      const isDebit = tx.amount >= 0;

      await db
        .update(transactions)
        .set({
          amount: Math.abs(tx.amount).toString(),
          type: (isDebit ? "debit" : "credit") as TransactionType,
          description: tx.name,
          merchant: tx.merchant_name ?? tx.name,
          category: mapPlaidCategoryToEnum(
            tx.personal_finance_category?.primary,
            tx.personal_finance_category?.detailed,
          ),
          updatedAt: new Date(),
        })
        .where(eq(transactions.plaidTxId, tx.transaction_id));
    }

    // ── 6. Delete removed transactions
    if (removedIds.length > 0) {
      await db
        .delete(transactions)
        .where(inArray(transactions.plaidTxId, removedIds));
    }

    return {
      added: txToInsert.length,
      modified: modified.length,
      removed: removedIds.length,
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapPlaidAccountType(plaidType: string): AccountType {
  const map: Record<string, AccountType> = {
    depository: "checking",
    credit: "credit",
    investment: "investment",
    brokerage: "investment",
    loan: "credit",
    mortgage: "credit",
  };
  return map[plaidType] ?? "checking";
}
