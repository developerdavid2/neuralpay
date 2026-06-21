import { db } from "@neuralpay/db";
import {
  bankAccounts,
  connectedPlaidBanks,
  transactions,
} from "@neuralpay/db/schema";
import type {
  AccountType,
  TransactionStatus,
  TransactionType,
} from "@neuralpay/types";
import { and, eq, inArray } from "drizzle-orm";
import { CountryCode, Products } from "plaid";
import { mapPlaidCategoryToEnum } from "../lib/plaidCategoryMap";
import { plaidClient } from "../lib/plaidClient";

export const PlaidService = {
  async getConnectedBanks(userId: string) {
    return db
      .select()
      .from(connectedPlaidBanks)
      .where(eq(connectedPlaidBanks.userId, userId));
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
    try {
      // Step 1: Exchange the public token for access token
      const exchange = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = exchange.data.access_token;
      const itemId = exchange.data.item_id;

      // Fetch institution id up front so we can check for duplicates
      const itemResponse = await plaidClient.itemGet({
        access_token: accessToken,
      });
      const institutionId = itemResponse.data.item.institution_id;
      let institutionName: string | null = null;

      if (institutionId) {
        try {
          const instResponse = await plaidClient.institutionsGetById({
            institution_id: institutionId,
            country_codes: [CountryCode.Us],
          });
          institutionName = instResponse.data.institution.name;
        } catch {
          // non-fatal
        }
      }

      // Check if this institution is already connected for this user
      const [existing] = institutionId
        ? await db
            .select()
            .from(connectedPlaidBanks)
            .where(
              and(
                eq(connectedPlaidBanks.userId, userId),
                eq(connectedPlaidBanks.institutionId, institutionId),
              ),
            )
            .limit(1)
        : [undefined];

      if (existing) {
        const oldItemId = existing.itemId;

        await db
          .update(connectedPlaidBanks)
          .set({
            accessToken,
            itemId,
            institutionName: institutionName ?? existing.institutionName,
            transactionCursor:
              existing.itemId !== itemId ? null : existing.transactionCursor,
            updatedAt: new Date(),
          })
          .where(eq(connectedPlaidBanks.id, existing.id));

        if (oldItemId) {
          await db
            .delete(bankAccounts)
            .where(
              and(
                eq(bankAccounts.userId, userId),
                eq(bankAccounts.plaidItemId, oldItemId),
              ),
            );
        }

        this.syncTransactions(
          userId,
          accessToken,
          itemId,
          institutionName ?? existing.institutionName,
        ).catch((err) => {
          console.error("[plaid] Background re-sync failed:", err);
        });

        return { success: true };
      }

      // Step 2: Save the connection immediately
      const [connectedBank] = await db
        .insert(connectedPlaidBanks)
        .values({
          userId,
          accessToken,
          itemId,
          institutionId,
          institutionName,
        })
        .returning();

      if (!connectedBank) {
        throw new Error("Failed to save connected bank");
      }

      // Step 3: Start background sync (don't await - fire and forget)
      this.syncTransactions(userId, accessToken, itemId, institutionName).catch(
        (err) => {
          console.error("[plaid] Background sync failed:", err);
        },
      );

      return { success: true };
    } catch (error) {
      console.error("[plaid] exchangePublicToken error:", error);
      throw error;
    }
  },

  async disconnectBankById(userId: string, bankId: string) {
    const [bank] = await db
      .select()
      .from(connectedPlaidBanks)
      .where(
        and(
          eq(connectedPlaidBanks.id, bankId),
          eq(connectedPlaidBanks.userId, userId),
        ),
      )
      .limit(1);

    if (!bank) return null;

    // Tell Plaid to invalidate the access token on their end
    if (bank.accessToken) {
      try {
        await plaidClient.itemRemove({ access_token: bank.accessToken });
        console.log("[plaid] Item removed from Plaid");
      } catch (err) {
        // Non-fatal — still proceed with local deletion
        console.error("[plaid] itemRemove failed:", err);
      }
    }

    // transactions cascade automatically from bankAccounts (onDelete: cascade)
    // so we only need to delete bankAccounts, then the connectedPlaidBanks row
    if (bank.itemId) {
      await db
        .delete(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.plaidItemId, bank.itemId),
          ),
        );
    }

    await db
      .delete(connectedPlaidBanks)
      .where(eq(connectedPlaidBanks.id, bankId));

    return { id: bankId };
  },

  async toggleInstitutionAccounts(
    userId: string,
    bankId: string,
    status: "active" | "inactive",
  ) {
    const [bank] = await db
      .select({ itemId: connectedPlaidBanks.itemId })
      .from(connectedPlaidBanks)
      .where(
        and(
          eq(connectedPlaidBanks.id, bankId),
          eq(connectedPlaidBanks.userId, userId),
        ),
      )
      .limit(1);

    if (!bank?.itemId) return null;

    await db
      .update(bankAccounts)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(bankAccounts.userId, userId),
          eq(bankAccounts.plaidItemId, bank.itemId),
        ),
      );

    return { id: bankId, status };
  },

  async syncTransactions(
    userId: string,
    accessToken: string,
    itemId: string,
    institutionName: string | null,
  ) {
    try {
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
              status: "active",
              plaidItemId: itemId,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(bankAccounts.id, existing.id));

          accountMap.set(acc.account_id, existing.id);
        } else {
          const [newAcc] = await db
            .insert(bankAccounts)
            .values({
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

          if (!newAcc) throw new Error("Failed to create bank account record");
          accountMap.set(acc.account_id, newAcc.id);
        }
      }

      // ── 2. Load the stored cursor for THIS bank connection
      const [bankRow] = await db
        .select({ transactionCursor: connectedPlaidBanks.transactionCursor })
        .from(connectedPlaidBanks)
        .where(
          and(
            eq(connectedPlaidBanks.userId, userId),
            eq(connectedPlaidBanks.itemId, itemId),
          ),
        )
        .limit(1);

      const added: Awaited<
        ReturnType<typeof plaidClient.transactionsSync>
      >["data"]["added"] = [];
      const modified: Awaited<
        ReturnType<typeof plaidClient.transactionsSync>
      >["data"]["modified"] = [];
      const removedIds: string[] = [];

      // Start from stored cursor — if null, Plaid returns everything from the start
      let cursor: string | undefined = bankRow?.transactionCursor ?? undefined;
      let hasMore = true;
      let nextCursor = cursor;

      // ── 3. Sync transactions with pagination
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
        removedIds.push(
          ...response.data.removed
            .map((r) => r.transaction_id)
            .filter((id): id is string => id !== undefined),
        );

        hasMore = response.data.has_more;
        nextCursor = response.data.next_cursor;
        cursor = response.data.next_cursor;
      }

      //  4. Insert added transactions
      const txToInsert = added
        .filter((tx) => accountMap.has(tx.account_id))
        .map((tx) => {
          const isDebit = tx.amount >= 0;

          return {
            userId,
            bankAccountId: accountMap.get(tx.account_id)!,
            description: tx.name,
            amount: Math.abs(tx.amount).toString(),
            type: (isDebit ? "debit" : "credit") as TransactionType,
            status: "successful" as TransactionStatus,
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
        await db.insert(transactions).values(txToInsert).onConflictDoNothing();
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

      // ── 7. Persist the cursor so next sync only fetches NEW changes
      if (nextCursor) {
        await db
          .update(connectedPlaidBanks)
          .set({ transactionCursor: nextCursor, updatedAt: new Date() })
          .where(
            and(
              eq(connectedPlaidBanks.userId, userId),
              eq(connectedPlaidBanks.itemId, itemId),
            ),
          );
      }

      return {
        added: txToInsert.length,
        modified: modified.length,
        removed: removedIds.length,
      };
    } catch (error) {
      console.error("[plaid] syncTransactions error:", error);
      throw error;
    }
  },
};

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
