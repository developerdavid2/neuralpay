"use client";

import { PlusIcon } from "lucide-react";
import { PremiumButton } from "@/components/premium-button";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";
import { useBudgetUrlSync } from "../../hooks/use-budget-url-sync";

export function NewBudgetButton() {
  const { onOpenAdd } = useBudgetDrawer();
  const { setUrl } = useBudgetUrlSync();

  const handleClick = () => {
    setUrl("add", null);
    onOpenAdd();
  };

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={handleClick}>
      New Budget
    </PremiumButton>
  );
}
