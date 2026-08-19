import { fetchGeneralContext } from "./general.context";
import { fetchAccountContext } from "./account.context";
import { fetchBudgetContext } from "./budget.context";
import { fetchTransactionContext } from "./transaction.context";
import { fetchInstitutionContext } from "./institution.context";
import { fetchVaultContext } from "./vault.context";
import { fetchSplitContext } from "./split.context";
import type { ContextSnapshot } from "@orra/types";

export async function fetchContext(
  userId: string,
  contextType: string,
  contextId: string | null,
): Promise<{ data: unknown; snapshot: ContextSnapshot }> {
  let data: unknown;

  switch (contextType) {
    case "general":
      data = await fetchGeneralContext(userId);
      break;
    case "transaction":
      data = contextId
        ? await fetchTransactionContext(userId, contextId)
        : { error: "No transaction ID provided" };
      break;
    case "budget":
      data = contextId
        ? await fetchBudgetContext(userId, contextId)
        : { error: "No budget ID provided" };
      break;
    case "account":
      data = contextId
        ? await fetchAccountContext(userId, contextId)
        : { error: "No account ID provided" };
      break;
    case "institution":
      data = contextId
        ? await fetchInstitutionContext(userId, contextId)
        : { error: "No institution ID provided" };
      break;
    case "vault":
      data = contextId
        ? await fetchVaultContext(userId, contextId)
        : { error: "No vault ID provided" };
      break;
    case "split":
      data = contextId
        ? await fetchSplitContext(userId, contextId)
        : { error: "No split ID provided" };
      break;
    case "insight":
      data = { note: "Insight context fetcher not yet implemented" };
      break;
    default:
      data = await fetchGeneralContext(userId);
  }

  const snapshot: ContextSnapshot = {
    type: contextType,
    data,
    fetchedAt: new Date().toISOString(),
  };

  return { data, snapshot };
}

export * from "./general.context";
export * from "./account.context";
export * from "./budget.context";
export * from "./transaction.context";
export * from "./institution.context";
export * from "./vault.context";
export * from "./split.context";
