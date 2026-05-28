import type { Transaction } from "@neuralpay/types";

export function isSyncedSource(tx: Transaction | null): boolean {
  if (!tx) return false;
  return !!(tx.plaidTxId || tx.monoTxId);
}
