"use client";

import { formatAmount } from "@/lib/utils";
import { MonthYearPicker } from "@/components/month-year-picker";
import type { Transaction } from "@neuralpay/types";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { forwardRef, useState } from "react";
import { transactionColumns } from "./columns";

interface Props {
  monthKey: string;
  transactions: Transaction[];
  globalSelection: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  columnVisibility: Record<string, boolean>;
  isActiveMonth: boolean;
  onMonthChange: (date: Date) => void;
  "data-month-key"?: string;
}

export const TransactionMonthSection = forwardRef<
  HTMLTableSectionElement,
  Props
>(function TransactionMonthSection(
  {
    monthKey,
    transactions,
    globalSelection,
    onSelectionChange,
    onView,
    onEdit,
    columnVisibility,
    isActiveMonth,
    onMonthChange,
    ...rest
  },
  ref,
) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const date = parseISO(`${monthKey}-01`);

  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const table = useReactTable({
    data: transactions,
    columns: transactionColumns({ onView, onEdit }),
    state: {
      sorting,
      columnVisibility,
      rowSelection: Object.fromEntries(
        transactions.map((t) => [t.id, globalSelection.has(t.id)]),
      ),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const currentSelection = Object.fromEntries(
        transactions.map((t) => [t.id, globalSelection.has(t.id)]),
      );
      const newSelection =
        typeof updater === "function" ? updater(currentSelection) : updater;
      const selectedIds = new Set(globalSelection);
      transactions.forEach((tx) => {
        if (newSelection[tx.id]) selectedIds.add(tx.id);
        else selectedIds.delete(tx.id);
      });
      onSelectionChange(selectedIds);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  // Count visible columns for the colspan on the month label row
  const visibleColCount =
    1 + // checkbox
    (columnVisibility["date"] !== false ? 1 : 0) +
    (columnVisibility["merchant"] !== false ? 1 : 0) +
    (columnVisibility["category"] !== false ? 1 : 0) +
    (columnVisibility["amount"] !== false ? 1 : 0) +
    (columnVisibility["status"] !== false ? 1 : 0) +
    1; // actions

  return (
    /*
        Renders as <tbody> so it lives inside the single <table> in transaction-list.tsx.
        This is what keeps columns aligned — one table, shared column widths.
      */
    <tbody ref={ref} {...rest}>
      {/*
          LAYER 4 — Month sub-header row.
          sticky top-[131px] = Layer 1 (57) + Layer 2 (41) + Layer 3 (33).
          bg-background ensures rows scrolling under it are hidden.

          Only the active (topmost) month shows the MonthYearPicker.
          All others show plain text. This matches the OPay/PalmPay pattern
          you described — the picker is always at the top, and updates as
          you scroll to a new month.
        */}
      <tr className="sticky top-[131px] z-[5]">
        <td
          colSpan={visibleColCount}
          className="bg-background border-y border-border px-4 py-1.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isActiveMonth ? (
                <MonthYearPicker value={date} onChange={onMonthChange} />
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {format(date, "MMMM yyyy")}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {transactions.length} transactions
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {formatAmount(totalSpent)} spent
            </span>
          </div>
        </td>
      </tr>

      {/* Transaction rows */}
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className={cn(
            "border-b border-border transition-colors hover:bg-accent/30",
            row.getIsSelected() && "bg-primary/5",
            row.original.isAnomaly && "border-l-2 border-l-destructive",
          )}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-4 py-3">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
});
