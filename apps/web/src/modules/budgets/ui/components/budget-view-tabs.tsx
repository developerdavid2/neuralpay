"use client";

import type { BudgetHealth } from "@neuralpay/types";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@neuralpay/ui/components/tabs";
import { CalendarDays, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { SectionBoundary } from "@/components/section-boundary";
import type { BudgetQueryState } from "../../types";
import { BudgetCalendar, BudgetCalendarSkeleton } from "./budget-calendar";
import { BudgetFilters } from "./budget-filters";
import { BudgetList, BudgetListSkeleton } from "./budget-list";
import { BudgetToolbar } from "./budget-toolbar";

interface BudgetViewTabsProps {
	queryState: BudgetQueryState;
	month: number;
	year: number;
	viewMode: "calendar" | "list";
}

export function BudgetViewTabs({
	queryState,
	month,
	year,
	viewMode,
}: BudgetViewTabsProps) {
	const router = useRouter();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [allBudgetIds, setAllBudgetIds] = useState<string[]>([]);

	const navigate = (updates: Record<string, string | undefined>) => {
		const params = new URLSearchParams(window.location.search);
		Object.entries(updates).forEach(([k, v]) => {
			if (v === undefined) params.delete(k);
			else params.set(k, v);
		});
		router.push(`?${params.toString()}`);
	};

	const handleSelect = useCallback((id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}, []);

	const handleSelectAll = useCallback((ids: string[]) => {
		setSelectedIds((prev) =>
			prev.size === ids.length && ids.length > 0 ? new Set() : new Set(ids),
		);
	}, []);

	const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

	return (
		<div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-muted bg-card shadow">
			<Tabs
				value={viewMode}
				onValueChange={(v) =>
					navigate({ view: v === "calendar" ? undefined : "list" })
				}
			>
				<div className="shrink-0 border-b border-border px-6 py-4">
					<div className="flex items-center justify-between">
						<TabsList>
							<TabsTrigger value="calendar" className="gap-1.5">
								<CalendarDays className="size-4" />
								Calendar
							</TabsTrigger>
							<TabsTrigger value="list" className="gap-1.5">
								<LayoutList className="size-4" />
								List
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

				<TabsContent value="calendar" className="mt-0 flex-1">
					<SectionBoundary
						key={`${year}-${month}`}
						fallback={<BudgetCalendarSkeleton />}
						errorMessage="Could not load calendar"
					>
						<BudgetCalendar month={month} year={year} />
					</SectionBoundary>
				</TabsContent>

				<TabsContent value="list" className="mt-0 flex flex-col flex-1">
					<div className="shrink-0 border-b border-border px-6 py-4">
						<BudgetFilters
							search={queryState.search}
							onSearchChange={(value) =>
								navigate({ search: value || undefined })
							}
						/>
					</div>

					<div className="shrink-0 border-b border-border px-6 py-3">
						<BudgetToolbar
							selectedCount={selectedIds.size}
							selectedIds={selectedArray}
							totalCount={allBudgetIds.length}
							allBudgetIds={allBudgetIds}
							onClearSelection={() => setSelectedIds(new Set())}
							onSelectAll={handleSelectAll}
						/>
					</div>

					<div className="flex-1 overflow-y-auto scrollbar-thin">
						<SectionBoundary
							fallback={<BudgetListSkeleton />}
							errorMessage="Could not load budgets"
						>
							<BudgetList
								queryState={queryState}
								selectedIds={selectedIds}
								onSelect={handleSelect}
								onAllBudgetIdsChange={setAllBudgetIds}
							/>
						</SectionBoundary>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
