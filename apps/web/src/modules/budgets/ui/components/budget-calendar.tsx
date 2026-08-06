"use client";

import { formatAmount } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@neuralpay/ui/components/tooltip";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Budget } from "@neuralpay/types";
import { useBudgetsList } from "../../hooks/queries/use-budgets";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";
import { HEALTH_META } from "../../constants";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function budgetsOnDay(budgets: Budget[], day: Date): Budget[] {
  return budgets.filter(
    (b) =>
      b.startDate &&
      b.endDate &&
      isWithinInterval(day, {
        start: new Date(b.startDate),
        end: new Date(b.endDate),
      }),
  );
}

export function BudgetCalendar({ anchor }: { anchor: Date }) {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  // Fetch budgets overlapping the visible month.
  const { budgets } = useBudgetsList({
    from: monthStart.toISOString(),
    to: monthEnd.toISOString(),
    isActive: true,
  });
  const { onOpenView } = useBudgetDrawer();

  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-muted bg-muted">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-card px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayBudgets = budgetsOnDay(budgets, day);
          const inMonth = isSameMonth(day, anchor);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-24 bg-card p-1.5 flex flex-col gap-1",
                !inMonth && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  inMonth ? "text-foreground" : "text-muted-foreground/50",
                  isToday(day) && "bg-primary font-semibold text-primary-foreground",
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayBudgets.slice(0, 3).map((b) => {
                  const health = HEALTH_META[b.status];
                  return (
                    <Tooltip key={b.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onOpenView(b.id, b)}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-left transition hover:bg-accent"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: b.color ?? "#6366f1" }}
                          />
                          <span className="truncate text-[10px] leading-tight">
                            {b.name ?? CATEGORY_LABELS[b.category]}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56">
                        <p className="font-semibold">
                          {b.name ?? CATEGORY_LABELS[b.category]}
                        </p>
                        <p className={cn("text-xs", health.color)}>
                          {formatAmount(b.spent)} /{" "}
                          {formatAmount(Number(b.limitAmount))} ·{" "}
                          {b.percentUsed}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {dayBudgets.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{dayBudgets.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BudgetCalendarSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-[520px] w-full rounded-2xl" />
    </div>
  );
}
