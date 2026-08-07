// modules/budgets/ui/components/budget-card.tsx
"use client";

import { Checkbox } from "@neuralpay/ui/components/checkbox";
import { cn } from "@neuralpay/ui/lib/utils";
import type { Budget } from "@neuralpay/types";
import { formatAmount } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

export function BudgetCard({ budget, selected, onSelect }: BudgetCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(budget.id, checked as boolean)}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{budget.name}</h3>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              budget.status === "on_track" && "bg-green-100 text-green-700",
              budget.status === "warning" && "bg-amber-100 text-amber-700",
              budget.status === "over" && "bg-red-100 text-red-700",
            )}
          >
            {budget.status.replace("_", " ")}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {formatAmount(budget.totalSpent)} /{" "}
            {formatAmount(parseFloat(budget.limitAmount))}
          </span>
          <span>{budget.percentUsed}%</span>
          <span>{budget.daysRemaining} days left</span>
        </div>
      </div>
    </div>
  );
}
