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
import { useBudgetUrlSync } from "../../hooks/use-budget-url-sync";

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
  const { onOpenView } = useBudgetDrawer();
  const { setUrl } = useBudgetUrlSync();
  const meta = HEALTH_META[budget.status];

  const percent = Math.min(
    (budget.totalSpent / parseFloat(budget.limitAmount)) * 100,
    100,
  );

  const handleView = () => {
    onOpenView(budget.id);
    setUrl("view", budget.id);
  };

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

      {/* Card container — relative for absolute children */}
      <div className="group relative flex-1">
        {/* Main card button — semantic, clickable, full width */}
        <button
          type="button"
          className={cn(
            "w-full flex flex-row items-start gap-3 transition-colors duration-150 text-left",
            "border border-border/50 rounded-xl",
            "px-5 py-4",
            selected ? "ring-1 ring-primary/30 bg-primary/4" : "bg-card",
            "hover:bg-accent dark:hover:bg-white/4",
          )}
          onClick={handleView}
        >
          {/* Icon / visual */}
          <div
            className={cn(
              "shrink-0 flex items-center justify-center rounded-xl ml-2 size-10",
              meta.badge,
            )}
          >
            <BarChart3 className="size-4.5 shrink-0" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
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

              {/* Spacer for dropdown — maintains layout but is invisible */}
              <div className="size-7 -mr-2 shrink-0" aria-hidden="true" />
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
        </button>

        {/* Dropdown — absolutely positioned, NOT nested inside the button */}
        <div className="absolute right-5 top-4 z-20">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 z-50">
              <DropdownMenuItem onSelect={handleView}>
                <Eye className="size-3.5 mr-2" />
                View budget
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Pencil className="size-3.5 mr-2" />
                Edit budget
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <MessageSquare className="size-3.5 mr-2" />
                Ask AI coach
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.stopPropagation();
                  onDelete?.(budget.id);
                }}
              >
                <Trash2 className="size-3.5 mr-2" />
                Delete budget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
