import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import type { BudgetHealth } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  BudgetCalendar,
  BudgetCalendarSkeleton,
} from "../components/budget-calendar";
import { BudgetFormDrawer } from "../components/budget-form-drawer";
import { BudgetList, BudgetListSkeleton } from "../components/budget-list";
import {
  BudgetSummaryCards,
  BudgetSummaryCardsSkeleton,
} from "../components/budget-summary-cards";
import { BudgetViewDrawer } from "../components/budget-view-drawer";
import { NewBudgetButton } from "../components/new-budget-button";

interface BudgetsViewProps {
  viewMode: "calendar" | "list";
  month: number;
  year: number;
  search: string;
  statuses: BudgetHealth[];
  isActive: boolean;
  sortField: string;
  sortDir: "asc" | "desc";
  limit: number;
  focusBudgetId?: string;
  focusMode?: string;
}

function buildHref(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export function BudgetsView({
  viewMode,
  month,
  year,
  search,
  statuses,
  isActive,
  sortField,
  sortDir,
  limit,
  focusBudgetId,
  focusMode,
}: BudgetsViewProps) {
  const anchor = new Date(year, month - 1);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const listFilters = {
    search: search.trim() || undefined,
    status: statuses.length > 0 ? statuses : undefined,
    isActive,
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
        <BudgetSummaryCards month={month} year={year} />
      </SectionBoundary>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-muted bg-card shadow">
        {/* Toolbar */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <Link
                href={buildHref({
                  view: viewMode === "calendar" ? undefined : "calendar",
                  month: String(month),
                  year: String(year),
                  search: search || undefined,
                })}
              >
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  asChild
                >
                  <span>
                    <CalendarDays className="size-4" />
                    Calendar
                  </span>
                </Button>
              </Link>
              <Link
                href={buildHref({
                  view: viewMode === "list" ? undefined : "list",
                  month: String(month),
                  year: String(year),
                  search: search || undefined,
                })}
              >
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  asChild
                >
                  <span>
                    <LayoutList className="size-4" />
                    List
                  </span>
                </Button>
              </Link>
            </div>

            {viewMode === "calendar" && (
              <div className="flex items-center gap-1">
                <Link
                  href={buildHref({
                    month: String(prevMonth),
                    year: String(prevYear),
                    view: "calendar",
                  })}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </Link>
                <span className="min-w-32 text-center text-sm font-medium">
                  {format(anchor, "MMMM yyyy")}
                </span>
                <Link
                  href={buildHref({
                    month: String(nextMonth),
                    year: String(nextYear),
                    view: "calendar",
                  })}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {viewMode === "list" && (
            <form
              action={(formData) => {
                const newSearch = formData.get("search") as string;
                // Use window.location for client-side navigation
                const url = new URL(window.location.href);
                if (newSearch) url.searchParams.set("search", newSearch);
                else url.searchParams.delete("search");
                window.location.href = url.toString();
              }}
              className="relative w-full sm:w-64"
            >
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search budgets..."
                className="pl-9"
              />
            </form>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {viewMode === "calendar" ? (
            <SectionBoundary
              key={`${year}-${month}`}
              fallback={<BudgetCalendarSkeleton />}
              errorMessage="Could not load calendar"
            >
              <BudgetCalendar month={month} year={year} />
            </SectionBoundary>
          ) : (
            <SectionBoundary
              key={search}
              fallback={<BudgetListSkeleton />}
              errorMessage="Could not load budgets"
            >
              <BudgetList
                filters={listFilters}
                sort={{ field: sortField, direction: sortDir }}
                limit={limit}
              />
            </SectionBoundary>
          )}
        </div>
      </div>

      <BudgetFormDrawer />
      <BudgetViewDrawer />
    </div>
  );
}
