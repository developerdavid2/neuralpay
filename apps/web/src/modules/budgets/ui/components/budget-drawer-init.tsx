"use client";

import { useDrawerInit } from "@/hooks/ui/use-drawer-init";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";

interface Props {
  focusId?: string;
  mode?: string;
}

export function BudgetDrawerInit({ focusId, mode }: Props) {
  const isAddMode = mode === "add";
  const shouldFetch = !!focusId && !isAddMode;
  const { budget, isLoading } = useBudgetDetail(shouldFetch ? focusId : "");

  useDrawerInit(
    focusId,
    mode,
    budget ?? undefined,
    shouldFetch && isLoading,
    useBudgetDrawer.getState,
    (s) => s.budgetId,
  );

  return null;
}
