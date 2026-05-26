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
import { useCallback, useMemo, useState } from "react";
import { TransactionDrawer } from "./transaction-drawer";
import { TransactionMonthSection } from "./transaction-month-section";
import { InfiniteScroll } from "@/components/infinite-scroll";

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

  const [globalSelection, setGlobalSelection] = useState<Set<string>>(
    new Set(),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useTransactionsList(filters);

  const allTransactions = useMemo(() => {
    const txs = data?.pages.flatMap((page) => page.items) ?? [];

    // Deduplicate by transaction ID, keeping first occurrence
    const seen = new Set<string>();
    return txs.filter((tx) => {
      if (seen.has(tx.id)) return false;
      seen.add(tx.id);
      return true;
    });
  }, [data?.pages]);

  const { grouped, sortedMonths } = useMemo(() => {
    const grouped = groupTransactionsByMonth(allTransactions);
    const sortedMonths = Array.from(grouped.keys()).sort().reverse();
    return { grouped, sortedMonths };
  }, [allTransactions]);

  const handleBatchDelete = useCallback(() => {
    const deletable = Array.from(globalSelection)
      .map((id) => allTransactions.find((t) => t.id === id))
      .filter((tx): tx is Transaction => !!tx && tx.isManual);
    console.log(
      "Batch delete:",
      deletable.map((t) => t.id),
    );
  }, [globalSelection, allTransactions]);

  const handleMonthChange = useCallback((date: Date) => {
    const yearMonth = format(date, "yyyy-MM");
    const monthStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const dateFromStr = format(monthStartDate, "yyyy-MM-dd");
    const dateToStr = format(monthEndDate, "yyyy-MM-dd");

    const params = new URLSearchParams(window.location.search);
    params.set("dateFrom", dateFromStr);
    params.set("dateTo", dateToStr);
    window.history.pushState({}, "", `?${params.toString()}`);
  }, []);

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
      {/* Toolbar: sticky under the 101px page header */}
      <div className="sticky top-[61px] z-30 bg-background border-b border-border px-6 py-2 flex items-center justify-between gap-4">
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

      <div className="px-6">
        <table className="w-full border-collapse">
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
              onMonthChange={handleMonthChange}
            />
          ))}
        </table>
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        isManual={false}
      />

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
