"use client";

import { PremiumButton } from "@/components/premium-button";
import { useTransactionUrlSync } from "@/modules/transactions/hooks/use-transaction-url-sync";
import { PlusIcon } from "lucide-react";
import { useTransactionDrawer } from "../../hooks/store/use-transaction-drawer";

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
