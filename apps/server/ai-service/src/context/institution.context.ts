import { bankAccounts, connectedPlaidBanks, db } from "@orra/db";
import { and, eq } from "drizzle-orm";

export async function fetchInstitutionContext(
  userId: string,
  institutionId: string,
): Promise<unknown> {
  const [bank] = await db
    .select()
    .from(connectedPlaidBanks)
    .where(
      and(
        eq(connectedPlaidBanks.id, institutionId),
        eq(connectedPlaidBanks.userId, userId),
      ),
    )
    .limit(1);

  if (!bank) return { error: "Connected bank not found" };

  const linkedAccounts = bank.itemId
    ? await db
        .select({
          id: bankAccounts.id,
          name: bankAccounts.name,
          type: bankAccounts.type,
          balance: bankAccounts.balance,
          status: bankAccounts.status,
          lastSyncedAt: bankAccounts.lastSyncedAt,
        })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.plaidItemId, bank.itemId),
          ),
        )
    : [];

  return {
    institution: { id: bank.id, name: bank.institutionName },
    linkedAccounts,
    accountCount: linkedAccounts.length,
  };
}
