"use client";

import { Button } from "@neuralpay/ui/components/button";
import { Plus } from "lucide-react";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";

export function NewBudgetButton() {
  const { onOpenAdd } = useBudgetDrawer();
  return (
    <Button onClick={onOpenAdd} className="gap-2">
      <Plus className="size-4" />
      New Budget
    </Button>
  );
}
