"use client";

import type { NotificationType } from "@neuralpay/types";
import { extractRelatedId } from "./notification-urls";
import { useTransactionDrawer } from "@/modules/transactions/hooks/store/use-transaction-drawer";
import { useAccountDrawer } from "@/modules/accounts/hooks/store/use-account-drawer";

// Central place to open the appropriate client-side UI for a notification.
// Returns true if an action was taken.
export function openNotificationTarget(
  type: NotificationType,
  data: Record<string, unknown>,
): boolean {
  const id = extractRelatedId(type, data);
  if (!id) return false;

  switch (type) {
    case "transaction_created":
    case "transaction_anomaly":
      useTransactionDrawer.getState().onOpenView(id as string);
      return true;

    case "account_connected":
    case "account_disconnected":
    case "account_sync_failed":
      useAccountDrawer.getState().onOpenView(id as string);
      return true;

    // add other programmatic UI targets here when available
    default:
      return false;
  }
}
