// modules/budgets/ui/components/budget-list.tsx
"use client";

import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useBudgetsList } from "../../hooks/queries/use-budgets";
import type { BudgetQueryState } from "../../types";
import { BudgetCard } from "./budget-card";

interface BudgetListProps {
	queryState: BudgetQueryState;
	selectedIds: Set<string>;
	onSelect: (id: string, checked: boolean) => void;
	onAllBudgetIdsChange: (ids: string[]) => void;
}

export function BudgetList({
	queryState,
	selectedIds,
	onSelect,
	onAllBudgetIdsChange,
}: BudgetListProps) {
	const { limit, search, statuses, isActive, period, sortField, sortDir } =
		queryState;
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
		useBudgetsList({
			limit,
			search: search || undefined,
			status: statuses.length > 0 ? statuses : undefined,
			isActive,
			period,
			sortField,
			sortDir,
		});

	const budgets = data?.pages.flatMap((p) => p.items) ?? [];

	useEffect(() => {
		onAllBudgetIdsChange(budgets.map((b) => b.id) || []);
	}, [budgets, onAllBudgetIdsChange]);

	if (budgets.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-center">
				<Sparkles className="size-8 text-muted-foreground mb-3" />
				<p className="text-sm font-medium text-foreground">No active budgets</p>
				<p className="text-xs text-muted-foreground mt-1">
					Create a new budget to begin
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-auto">
				{budgets.map((budget) => (
					<BudgetCard
						key={budget.id}
						budget={budget}
						selected={selectedIds.has(budget.id)}
						onSelect={onSelect}
					/>
				))}

				<InfiniteScroll
					hasNextPage={hasNextPage ?? false}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}

export function BudgetListSkeleton() {
	return (
		<div className="flex flex-col gap-3 p-6">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className="h-24 w-full animate-pulse rounded-xl bg-muted"
				/>
			))}
		</div>
	);
}
