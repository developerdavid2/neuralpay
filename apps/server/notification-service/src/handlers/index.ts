// handlers/index.ts
import type { NotificationEvent } from "@neuralpay/types";
import { handleTransaction } from "./transaction.handler";
import { handleSplit } from "./split.handler";
import { handleVault } from "./vault.handler";
import { handleAccount } from "./account.handler";
import { handleAi } from "./ai.handler";
import { handleBudget } from "./budget.handler";
import { handleSubscription } from "./subscription.handler";
import { handleSystem } from "./system.handler";
import { handleSecurity } from "./security.handler";
// import { handleBudget } from "./budget.handler";

export async function handleEvent(event: NotificationEvent) {
  switch (event.type) {
    case "transaction_created":
    case "transaction_anomaly":
      return handleTransaction(event);
    case "ai_insight":
    case "ai_weekly_report":
      return handleAi(event);
    case "split_invite":
    case "split_paid":
    case "split_settled":
    case "split_reminder":
      return handleSplit(event);
    case "vault_milestone":
    case "vault_contribution":
    case "vault_invite":
      return handleVault(event);
    case "account_connected":
    case "account_disconnected":
    case "account_sync_failed":
      return handleAccount(event);
    case "budget_threshold":
      return handleBudget(event);
    case "subscription_expiring":
    case "subscription_renewed":
    case "subscription_cancelled":
      return handleSubscription(event);
    case "system_maintenance":
    case "system_welcome":
      return handleSystem(event);
    case "security_alert":
      return handleSecurity(event);
    default:
      // TypeScript exhaustiveness check
      console.warn("Unhandled event:", (event as any).type);
  }
}
