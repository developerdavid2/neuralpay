"use client";

import { useBudgetCalendar } from "../../hooks/queries/use-budget-calendar";

interface BudgetCalendarProps {
  month: number;
  year: number;
}

export function BudgetCalendar({ month, year }: BudgetCalendarProps) {
  const { budgetsCalendar } = useBudgetCalendar({ month, year });

  return (
    <div className="p-6">
      {budgetsCalendar.map((day) => (
        <div key={day.date}>{/* Day cell with budgets */}</div>
      ))}
    </div>
  );
}

export function BudgetCalendarSkeleton() {
  return (
    <div className="p-6">
      <div className="h-96 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
