"use client";

import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useTransactionsList } from "@/hooks/transactions/use-transactions";
import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import type { Transaction, TransactionStatus } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { format } from "date-fns";
import { Package, Settings2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TransactionDrawer } from "./transaction-drawer";
import { TransactionMonthSection } from "./transaction-month-section";

interface Props {
  focusTransactionId?: string;
  currentSearch: string;
  currentType?: string;
  currentStatuses?: string[];
  currentAccountType: string;
  currentAccountId: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentCategories: string[];
  currentIsManual: boolean;
  currentIsAnomaly: boolean;
  currentAmountMin: string;
  currentAmountMax: string;
  currentLimit: number;
  onActiveMonthChange?: (month: string) => void;
}

function groupTransactionsByMonth(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const monthKey = format(new Date(tx.date), "yyyy-MM");
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(tx);
  }
  return grouped;
}

export function TransactionsList({
  focusTransactionId,
  currentSearch,
  currentType,
  currentStatuses,
  currentAccountType,
  currentAccountId,
  currentDateFrom,
  currentDateTo,
  currentCategories,
  currentIsManual,
  currentIsAnomaly,
  currentAmountMin,
  currentAmountMax,
  currentLimit,
  onActiveMonthChange,
}: Props) {
  const {
    openView,
    openEdit,
    drawerOpen,
    drawerMode,
    selectedTransactionId,
    closeDrawer,
  } = useTransactionMutations();

  const filters = useMemo(
    () => ({
      search: currentSearch || undefined,
      type: currentType as "debit" | "credit" | undefined,
      status: currentStatuses?.[0] as TransactionStatus | undefined,
      bankAccountId: currentAccountId || undefined,
      isManual: currentIsManual || undefined,
      isAnomaly: currentIsAnomaly || undefined,
      dateFrom: currentDateFrom || undefined,
      dateTo: currentDateTo || undefined,
      minAmount: currentAmountMin ? Number(currentAmountMin) : undefined,
      maxAmount: currentAmountMax ? Number(currentAmountMax) : undefined,
      category: currentCategories[0] || undefined,
      limit: currentLimit || TRANSACTIONS_LIMIT,
    }),
    [
      currentSearch,
      currentType,
      currentStatuses,
      currentAccountId,
      currentIsManual,
      currentIsAnomaly,
      currentDateFrom,
      currentDateTo,
      currentAmountMin,
      currentAmountMax,
      currentCategories,
      currentLimit,
    ],
  );

  // All state declared before any early returns
  const [globalSelection, setGlobalSelection] = useState<Set<string>>(
    new Set(),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [activeMonth, setActiveMonth] = useState<string>("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useTransactionsList(filters);

  const allTransactions = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const { grouped, sortedMonths } = useMemo(() => {
    const grouped = groupTransactionsByMonth(allTransactions);
    const sortedMonths = Array.from(grouped.keys()).sort().reverse();
    return { grouped, sortedMonths };
  }, [allTransactions]);

  // Set initial active month once data loads
  useEffect(() => {
    if (sortedMonths.length > 0 && !activeMonth) {
      setActiveMonth(sortedMonths[0]!);
    }
  }, [sortedMonths, activeMonth]);

  // IntersectionObserver to auto-update active month on scroll
  useEffect(() => {
    if (sortedMonths.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const key = (visible[0].target as HTMLElement).dataset.monthKey;
          if (key) {
            setActiveMonth(key);
            onActiveMonthChange?.(key);
          }
        }
      },
      { threshold: 0.1, rootMargin: "-130px 0px 0px 0px" },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sortedMonths, onActiveMonthChange]);

  const handleBatchDelete = useCallback(() => {
    const deletable = Array.from(globalSelection)
      .map((id) => allTransactions.find((t) => t.id === id))
      .filter((tx): tx is Transaction => !!tx && tx.isManual);
    console.log(
      "Batch delete:",
      deletable.map((t) => t.id),
    );
  }, [globalSelection, allTransactions]);

  const selectedCount = globalSelection.size;
  const deletableCount = Array.from(globalSelection).filter((id) => {
    const tx = allTransactions.find((t) => t.id === id);
    return tx?.isManual;
  }).length;

  if (isLoading) return <TransactionsListSkeleton />;

  if (allTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try adjusting your filters or add a new transaction
        </p>
      </div>
    );
  }

  return (
    <>
      {/*
        LAYER 2 — Controls bar.
        sticky top-[57px] = directly below the filter bar (Layer 1 ≈ 57px tall).
        Adjust this value if your filter bar height differs.
      */}
      <div className="sticky top-[57px] z-20 bg-background border-b border-border px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={String(currentLimit)}
            onValueChange={(v) => {
              const params = new URLSearchParams(window.location.search);
              params.set("limit", v);
              window.history.pushState({}, "", `?${params.toString()}`);
            }}
          >
            <SelectTrigger className="h-7 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["10", "20", "50", "100"].map((n) => (
                <SelectItem key={n} value={n} className="text-xs">
                  {n} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
              >
                <Settings2 className="size-3.5" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["date", "merchant", "category", "amount", "status"].map(
                (col) => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={columnVisibility[col] !== false}
                    onCheckedChange={(val) =>
                      setColumnVisibility((prev) => ({ ...prev, [col]: val }))
                    }
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </DropdownMenuCheckboxItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>
            {deletableCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({deletableCount} deletable)
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalSelection(new Set())}
            >
              Clear
            </Button>
            {deletableCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 className="size-3.5 mr-1" />
                Delete {deletableCount}
              </Button>
            )}
          </div>
        )}
      </div>

      {/*
        Single table — no wrapper div with overflow.
        noWrapper removes the overflow-x-auto div that shadcn adds,
        which would otherwise kill sticky on the thead.
      */}
      <div className="px-6">
        <table className="w-full border-collapse">
          {/*
            LAYER 3 — Column headers.
            sticky top-[98px] = Layer 1 (57px) + Layer 2 (41px).
            bg-background needed so rows don't show through when scrolling.
          */}
          <thead className="sticky top-[98px] z-10 bg-background">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 w-10" />
              {columnVisibility["date"] !== false && (
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  Date
                </th>
              )}
              {columnVisibility["merchant"] !== false && (
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Merchant / Description
                </th>
              )}
              {columnVisibility["category"] !== false && (
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  Category
                </th>
              )}
              {columnVisibility["amount"] !== false && (
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
                  Amount
                </th>
              )}
              {columnVisibility["status"] !== false && (
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[110px]">
                  Status
                </th>
              )}
              <th className="px-4 py-2.5 w-12" />
            </tr>
          </thead>

          {/*
            Month groups — each TransactionMonthSection renders as a <tbody>.
            The month sub-header row inside each tbody is sticky top-[131px]
            = Layer 1 (57) + Layer 2 (41) + Layer 3 (33).
          */}
          {sortedMonths.map((monthKey) => (
            <TransactionMonthSection
              key={monthKey}
              monthKey={monthKey}
              transactions={grouped.get(monthKey)!}
              globalSelection={globalSelection}
              onSelectionChange={setGlobalSelection}
              onView={openView}
              onEdit={openEdit}
              columnVisibility={columnVisibility}
              isActiveMonth={monthKey === activeMonth}
              onMonthChange={(date) => {
                const key = format(date, "yyyy-MM");
                const el = sectionRefs.current.get(key);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveMonth(key);
              }}
              ref={(el: HTMLElement | null) => {
                if (el) sectionRefs.current.set(monthKey, el);
                else sectionRefs.current.delete(monthKey);
              }}
              data-month-key={monthKey}
            />
          ))}
        </table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      <TransactionDrawer
        transactionId={selectedTransactionId}
        mode={drawerMode}
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      />
    </>
  );
}

export function TransactionsListSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {Array.from({ length: 3 }).map((_, monthIdx) => (
        <div
          key={monthIdx}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: 4 }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="size-7 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-16 hidden sm:block" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="size-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
