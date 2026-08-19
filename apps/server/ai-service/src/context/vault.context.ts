import { db, vaults } from "@orra/db";
import { and, eq } from "drizzle-orm";

export async function fetchVaultContext(
  userId: string,
  vaultId: string,
): Promise<unknown> {
  const [vault] = await db
    .select()
    .from(vaults)
    .where(and(eq(vaults.id, vaultId), eq(vaults.userId, userId)))
    .limit(1);

  if (!vault) return { error: "Vault not found" };

  const target = Number(vault.targetAmount);
  const current = Number(vault.currentAmount);

  return {
    vault,
    progress: target > 0 ? Math.round((current / target) * 100) : 0,
    remaining: target - current,
  };
}
