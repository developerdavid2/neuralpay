"use client";

import { useDrawerInit } from "@/hooks/ui/use-drawer-init";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";

interface Props {
	focusId?: string;
	mode?: string;
}

export function BudgetDrawerInit({ focusId, mode }: Props) {
	const { budget, isLoading } = useBudgetDetail(focusId);

	useDrawerInit(
		focusId,
		mode,
		budget ?? undefined,
		isLoading,
		useBudgetDrawer.getState,
		(s) => s.budgetId,
	);

	return null;
}
