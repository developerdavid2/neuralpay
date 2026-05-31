"use client";

import { PremiumButton } from "@/components/premium-button";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { PlusIcon } from "lucide-react";

export function NewTransactionButton() {
  const { onOpenAdd } = useTransactionDrawer();

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={onOpenAdd}>
      New Transaction
    </PremiumButton>
  );
}
