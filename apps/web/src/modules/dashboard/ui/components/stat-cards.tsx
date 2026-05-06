"use client";

import { useStatCards } from "@/hooks/dashboard/use-stat-cards";
import { cn } from "@neuralpay/ui/lib/utils";
import { cardTemplates } from "../../constants";

export function StatCards() {
  const { totalBalance, monthSpending, savingsRate, accountCount } =
    useStatCards();

  // Values must be in the same order as cardTemplates

  const values = [totalBalance, monthSpending, savingsRate, accountCount];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 font-sans">
      {cardTemplates.map((card, index) => (
        <div
          key={card.label}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {card.label}
            </span>
            <span className={cn("rounded-lg p-2", card.iconBg)}>
              <card.icon className={cn("size-4", card.accent)} />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {card.formatValue(values[index] ?? 0)}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              card.up ? "text-[#0EA5A0]" : "text-destructive",
            )}
          >
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
