"use client";

import { Skeleton } from "@neuralpay/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neuralpay/ui/components/tabs";
import { CalendarDays, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SectionBoundary } from "@/components/section-boundary";
import type { BudgetQueryState } from "../../types";
import { BudgetCalendar, BudgetCalendarSkeleton } from "./budget-calendar";
import { BudgetFilters } from "./budget-filters";
import { BudgetFormDrawer } from "./budget-form-drawer";
import { BudgetList, BudgetListSkeleton } from "./budget-list";
import { BudgetToolbar } from "./budget-toolbar";
import { BudgetViewDrawer } from "./budget-view-drawer";

interface BudgetViewTabsProps {
  queryState: BudgetQueryState;
  calMonth: number;
  calYear: number;
  viewMode: "calendar" | "list";
}

export function BudgetViewTabs({
  queryState,
  calMonth,
  calYear,
  viewMode,
}: BudgetViewTabsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(viewMode);

  const navigate = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    });

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleTabChange = (v: string) => {
    setActiveTab(v as "calendar" | "list");
    navigate({ view: v === "calendar" ? undefined : "list" });
  };

  const listKey = useMemo(
    () =>
      [
        queryState.search ?? "",
        queryState.statuses.join(","),
        queryState.isActive ?? "",
        queryState.period ?? "",
        queryState.month ?? "",
        queryState.year ?? "",
        queryState.sortField,
        queryState.sortDir,
        queryState.limit,
      ].join("|"),
    [queryState],
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="rounded-2xl overflow-hidden border border-muted bg-card shadow"
      >
        <div className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-accent">
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarDays className="size-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <LayoutList className="size-4" />
                List
              </TabsTrigger>
            </TabsList>
            {activeTab === "list" && <BudgetFilters />}
          </div>
        </div>

        <TabsContent value="calendar" className="mt-0 flex-1 min-h-0">
          <SectionBoundary
            key={`${calYear}-${calMonth}`}
            fallback={<BudgetCalendarSkeleton />}
            errorMessage="Could not load calendar"
          >
            <BudgetCalendar month={calMonth} year={calYear} />
          </SectionBoundary>
        </TabsContent>

        <TabsContent value="list" className="mt-0 flex flex-col flex-1 min-h-0">
          <div className="shrink-0 border-b border-border px-10 py-3">
            <BudgetToolbar />
          </div>

          <div className="overflow-hidden h-[105vh] flex-1 min-h-0 scrollbar-hide">
            <SectionBoundary
              key={listKey}
              fallback={<BudgetListSkeleton />}
              errorMessage="Could not load budgets"
            >
              <BudgetList queryState={queryState} />
            </SectionBoundary>
          </div>
        </TabsContent>
      </Tabs>
      <BudgetFormDrawer />
      <BudgetViewDrawer />
    </>
  );
}

export function BudgetViewTabsSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-muted bg-card shadow flex flex-col">
      {/* Tab bar + filters */}
      <div className="shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-56 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Toolbar strip */}
      <div className="shrink-0 border-b border-border px-10 py-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0">
        <BudgetListSkeleton />
      </div>
    </div>
  );
}
