"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { cn } from "@neuralpay/ui/lib/utils";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { BudgetsFilterInput } from "@neuralpay/types";
import {
  BudgetSummaryCards,
  BudgetSummaryCardsSkeleton,
} from "../components/budget-summary-cards";
import {
  BudgetCalendar,
  BudgetCalendarSkeleton,
} from "../components/budget-calendar";
import { BudgetList, BudgetListSkeleton } from "../components/budget-list";
import { BudgetFormDrawer } from "../components/budget-form-drawer";
import { BudgetViewDrawer } from "../components/budget-view-drawer";
import { NewBudgetButton } from "../components/new-budget-button";
import { nextPeriodAnchor } from "../../constants";
import type { BudgetViewMode } from "../../constants";

export function BudgetsView() {
  const [viewMode, setViewMode] = useState<BudgetViewMode>("calendar");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");

  const listFilters: BudgetsFilterInput = {
    search: search.trim() || undefined,
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 p-10">
      <DashboardHeader
        title="Budgets"
        description="Set spending limits by category and track them across your accounts."
        action={<NewBudgetButton />}
      />

      <SectionBoundary
        fallback={<BudgetSummaryCardsSkeleton />}
        errorMessage="Could not load budget summary"
      >
        <BudgetSummaryCards />
      </SectionBoundary>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-muted bg-card shadow">
        {/* Toolbar */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="size-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="size-4" />
                List
              </Button>
            </div>

            {viewMode === "calendar" && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setAnchor((a) => nextPeriodAnchor("monthly", a, -1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-32 text-center text-sm font-medium">
                  {format(anchor, "MMMM yyyy")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setAnchor((a) => nextPeriodAnchor("monthly", a, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {viewMode === "list" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search budgets..."
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {viewMode === "calendar" ? (
            <SectionBoundary
              key={format(anchor, "yyyy-MM")}
              fallback={<BudgetCalendarSkeleton />}
              errorMessage="Could not load calendar"
            >
              <BudgetCalendar anchor={anchor} />
            </SectionBoundary>
          ) : (
            <SectionBoundary
              key={search}
              fallback={<BudgetListSkeleton />}
              errorMessage="Could not load budgets"
            >
              <BudgetList filters={listFilters} />
            </SectionBoundary>
          )}
        </div>
      </div>

      <BudgetFormDrawer />
      <BudgetViewDrawer />
    </div>
  );
}
