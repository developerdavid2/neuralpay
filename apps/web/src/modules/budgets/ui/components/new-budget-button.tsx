"use client";

import { PremiumButton } from "@/components/premium-button";
import { PlusIcon } from "lucide-react";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";

export function NewBudgetButton() {
  const { onOpenAdd } = useBudgetDrawer();
  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={onOpenAdd}>
      New Budget
    </PremiumButton>
  );
}
