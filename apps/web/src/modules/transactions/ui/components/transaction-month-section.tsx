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
  onMonthChange: (date: Date) => void;
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
    onMonthChange,
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

  const visibleColCount =
    1 + // checkbox
    (columnVisibility["date"] !== false ? 1 : 0) +
    (columnVisibility["merchant"] !== false ? 1 : 0) +
    (columnVisibility["category"] !== false ? 1 : 0) +
    (columnVisibility["amount"] !== false ? 1 : 0) +
    (columnVisibility["status"] !== false ? 1 : 0) +
    1; // actions

  return (
    <tbody ref={ref}>
      {/* Month Header: sticky under toolbar (101 + 53 = 154px) */}
      <tr className="sticky top-[114px] z-20">
        <td
          colSpan={visibleColCount}
          className="bg-accent/50 border-y border-border px-4 py-4 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MonthYearPicker value={date} onChange={onMonthChange} />
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

      {/* Column Headers: sticky under month header (101 + 53 + 41 = 195px) */}
      <tr className="sticky top-[174px] z-10 bg-secondary border-b border-border">
        <th className="px-4 py-2.5 w-10" />
        {columnVisibility["date"] !== false && (
          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
            Date
          </th>
        )}
        {columnVisibility["merchant"] !== false && (
          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
            Merchant / Description
          </th>
        )}
        {columnVisibility["category"] !== false && (
          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
            Category
          </th>
        )}
        {columnVisibility["amount"] !== false && (
          <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
            Amount
          </th>
        )}
        {columnVisibility["status"] !== false && (
          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
            Status
          </th>
        )}
        <th className="px-4 py-2.5 w-12" />
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
