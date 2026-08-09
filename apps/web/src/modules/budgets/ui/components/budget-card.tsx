"use client";

import type { Budget } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import { cn } from "@neuralpay/ui/lib/utils";
import {
	BarChart3,
	Eye,
	MessageSquare,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { HEALTH_META } from "../../constants";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";

interface BudgetCardProps {
	budget: Budget;
	selected: boolean;
	onSelect: (id: string, checked: boolean) => void;
	onDelete?: (id: string) => void;
	onAskCoach?: (budget: Budget) => void;
}

export function BudgetCard({
	budget,
	selected,
	onSelect,
	onDelete,
	onAskCoach,
}: BudgetCardProps) {
	const openDrawer = useBudgetDrawer((s) => s.onOpenView);
	const openEdit = useBudgetDrawer((s) => s.onOpenEdit);
	const meta = HEALTH_META[budget.status];

	const percent = Math.min(
		(budget.totalSpent / parseFloat(budget.limitAmount)) * 100,
		100,
	);

	return (
		<div className="flex items-center gap-3 mx-6 py-1.5 px-4">
			{/* Checkbox — outside card */}
			<div data-checkbox className="shrink-0">
				<Checkbox
					checked={selected}
					onCheckedChange={(checked) => onSelect(budget.id, checked as boolean)}
					className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
				/>
			</div>

			{/* Card */}
			<div
				className={cn(
					"group relative flex-1 flex flex-row items-start gap-3 transition-colors duration-150",
					"border border-border/50 rounded-xl",
					"px-5 py-4",
					selected ? "ring-1 ring-primary/30 bg-primary/4" : "bg-card",
					"hover:bg-accent dark:hover:bg-white/4",
				)}
			>
				{/* Clickable overlay — sits behind content */}
				<button
					type="button"
					className="absolute inset-0 z-0 cursor-pointer rounded-xl"
					onClick={() => openDrawer(budget.id)}
					aria-label={`View ${budget.name} budget details`}
				/>

				{/* Icon / visual */}
				<div
					className={cn(
						"relative z-10 shrink-0 flex items-center justify-center rounded-xl ml-2 size-10",
						meta.badge,
					)}
				>
					<BarChart3 className="size-4.5 shrink-0" />
				</div>

				{/* Content */}
				<div className="relative z-10 flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 min-w-0">
							<h3 className="font-medium text-sm leading-snug line-clamp-1">
								{budget.name}
							</h3>
							<span
								className={cn(
									"text-[10px] font-medium px-1.5 py-0 h-4 shrink-0 rounded-full border",
									meta.badge,
								)}
							>
								{meta.label}
							</span>
						</div>

						{/* Actions dropdown — z-20 sits above overlay */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="relative z-20 size-7 -mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreVertical className="size-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44 z-50">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										openDrawer(budget.id);
									}}
								>
									<Eye className="size-3.5 mr-2" />
									View budget
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										openEdit(budget.id);
									}}
								>
									<Pencil className="size-3.5 mr-2" />
									Edit budget
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onAskCoach?.(budget);
									}}
								>
									<MessageSquare className="size-3.5 mr-2" />
									Ask AI coach
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={(e) => {
										e.stopPropagation();
										onDelete?.(budget.id);
									}}
								>
									<Trash2 className="size-3.5 mr-2 " />
									Delete budget
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Progress bar */}
					<div className="mt-2.5">
						<div className="flex items-center justify-between text-xs mb-1">
							<span className="text-muted-foreground">
								{formatAmount(budget.totalSpent)} /{" "}
								{formatAmount(parseFloat(budget.limitAmount))}
							</span>
							<span className={cn("font-medium tabular-nums", meta.text)}>
								{budget.totalPercentUsed}%
							</span>
						</div>
						<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
							<div
								className={cn("h-full rounded-full transition-all", meta.bar)}
								style={{ width: `${percent}%` }}
							/>
						</div>
					</div>

					{/* Meta row */}
					<div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70">
						<span>{budget.daysRemaining} days remaining</span>
						<span>·</span>
						<span className="capitalize">{budget.period}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
