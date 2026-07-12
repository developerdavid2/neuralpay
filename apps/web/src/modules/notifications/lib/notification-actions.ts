"use client";

import type { NotificationType } from "@neuralpay/types";
import { extractRelatedId } from "./notification-urls";
import { useTransactionDrawer } from "@/modules/transactions/hooks/store/use-transaction-drawer";
import { useAccountDrawer } from "@/modules/accounts/hooks/store/use-account-drawer";

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

    // add other programmatic UI targets here when available
    default:
      return false;
  }
}
