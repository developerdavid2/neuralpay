"use client";

import { useDrawerInit } from "@/hooks/ui/use-drawer-init";
import { useTransactionDetail } from "../../hooks/queries/use-transaction-detail";
import { useTransactionDrawer } from "../../hooks/store/use-transaction-drawer";

interface Props {
  focusId?: string;
  mode?: string;
}

export function TransactionDrawerInit({ focusId, mode }: Props) {
  const { transaction, isLoading } = useTransactionDetail(focusId ?? "");
  useDrawerInit(
    focusId,
    mode,
    transaction ?? undefined,
    isLoading,
    useTransactionDrawer.getState,
    (s) => s.transactionId,
  );
  return null;
}
