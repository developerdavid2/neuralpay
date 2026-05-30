"use client";

import { PlusIcon } from "lucide-react";
import { PremiumButton } from "@/components/premium-button";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionUrlSync } from "@/hooks/transactions/use-transaction-url-sync";

export function NewTransactionButton() {
  const { onOpenAdd } = useTransactionDrawer();
  const { syncToUrl } = useTransactionUrlSync();

  const handleOpenAdd = () => {
    onOpenAdd();
    syncToUrl("add", null);
  };

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={handleOpenAdd}>
      New Transaction
    </PremiumButton>
  );
}
