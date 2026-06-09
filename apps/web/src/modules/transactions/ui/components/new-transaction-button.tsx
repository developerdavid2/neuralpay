// modules/transactions/components/new-transaction-button.tsx
"use client";

import { PremiumButton } from "@/components/premium-button";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionUrlSync } from "@/modules/transactions/hooks/use-transaction-url-sync";
import { PlusIcon } from "lucide-react";

export function NewTransactionButton() {
  const { onOpenAdd } = useTransactionDrawer();
  const { syncToUrl } = useTransactionUrlSync();

  const handleClick = () => {
    syncToUrl("add", null);
    onOpenAdd();
  };

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={handleClick}>
      New Transaction
    </PremiumButton>
  );
}
