"use client";

import { MonthYearPicker } from "@/components/month-year-picker";
import { formatAmount } from "@/lib/utils";
import type { Transaction } from "@neuralpay/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@neuralpay/ui/components/table";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useState } from "react";
import { transactionColumns } from "./columns";

interface Props {
  monthKey: string;
  transactions: Transaction[];
  globalSelection: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  columnVisibility: Record<string, boolean>;
}

export const TransactionMonthSection = forwardRef<HTMLDivElement, Props>(
  function TransactionMonthSection(
    {
      monthKey,
      transactions,
      globalSelection,
      onSelectionChange,
      onView,
      onEdit,
      onDelete,
      columnVisibility,
    },
    ref,
  ) {
    const [sorting, setSorting] = useState<SortingState>([
      { id: "date", desc: true },
    ]);

    const router = useRouter();
    const date = parseISO(`${monthKey}-01`);

    const totalSpent = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const table = useReactTable({
      data: transactions,
      columns: transactionColumns({ onView, onEdit, onDelete }),
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

    const handleMonthChange = useCallback(
      (date: Date) => {
        const monthStartDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), 1),
        );
        const monthEndDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
        );

        const params = new URLSearchParams(window.location.search);
        params.set("dateFrom", monthStartDate.toISOString());
        params.set("dateTo", monthEndDate.toISOString());
        router.push(
          `${window.location.pathname}?${params.toString()}` as never,
        );
      },
      [router],
    );

    return (
      <div ref={ref}>
        {/* Month Header — sticky within the scroll container */}
        <div className="sticky top-0 z-20 bg-accent/50 border-y border-border px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MonthYearPicker value={date} onChange={handleMonthChange} />
              <span className="text-xs text-muted-foreground">
                {transactions.length} transactions
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {formatAmount(totalSpent)} spent
            </span>
          </div>
        </div>

        <Table noWrapper>
          <TableHeader className="sticky top-[53.6px] z-20 backdrop-blur-xl bg-muted drop-shadow-lg dark:bg-secondary">
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  if (!header.column.getIsVisible()) return null;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                        header.id === "select" && "w-10",
                        header.id === "date" && "w-[100px]",
                        header.id === "category" && "w-[140px]",
                        header.id === "amount" && "w-[140px] text-right",
                        header.id === "status" && "w-[140px]",
                        header.id === "actions" && "w-12",
                      )}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                }),
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  row.getIsSelected() && "bg-primary/5",
                  row.original.isAnomaly && "border-l-2 border-l-destructive",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
);
