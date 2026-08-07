"use client";

import { Button } from "@neuralpay/ui/components/button";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import { Trash2 } from "lucide-react";
import { useDeleteManyBudgets } from "../../hooks/mutations/use-delete-many-budgets";

interface BudgetToolbarProps {
	selectedCount: number;
	selectedIds: string[];
	totalCount: number;
	allBudgetIds: string[];
	onClearSelection: () => void;
	onSelectAll: (ids: string[]) => void;
}

export function BudgetToolbar({
	selectedCount,
	selectedIds,
	totalCount,
	allBudgetIds,
	onClearSelection,
	onSelectAll,
}: BudgetToolbarProps) {
	const deleteMany = useDeleteManyBudgets();

	const isAllSelected = totalCount > 0 && selectedCount === totalCount;
	const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

	if (selectedCount > 0) {
		return (
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2.5">
					<Checkbox
						checked={isAllSelected}
						ref={(el) => {
							if (el) el.indeterminate = isPartialSelected;
						}}
						onCheckedChange={() => {
							if (isAllSelected) onClearSelection();
							else onSelectAll(allBudgetIds);
						}}
					/>
					<span className="text-sm font-medium">{selectedCount} selected</span>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={onClearSelection}>
						Clear
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => deleteMany.mutate({ ids: selectedIds })}
						disabled={deleteMany.isPending}
					>
						<Trash2 className="mr-1.5 size-3.5" />
						{deleteMany.isPending ? "Deleting..." : `Delete ${selectedCount}`}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2.5">
			<Checkbox
				checked={false}
				onCheckedChange={() => onSelectAll(allBudgetIds)}
				disabled={totalCount === 0}
			/>
			<span className="text-sm text-muted-foreground">
				{totalCount > 0
					? `${totalCount} budget${totalCount !== 1 ? "s" : ""}`
					: "No budgets"}
			</span>
		</div>
	);
}
