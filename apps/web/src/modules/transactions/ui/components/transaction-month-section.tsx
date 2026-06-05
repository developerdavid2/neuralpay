// modules/transactions/ui/transaction-month-section.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { MonthYearPicker } from "@/components/month-year-picker";
import { formatAmount } from "@/lib/utils";
import type { Transaction } from "@neuralpay/types";
import { parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { transactionColumns } from "./transaction-columns";

interface Props {
  monthKey: string;
  transactions: Transaction[];
  globalSelection: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  isRowPending: (id: string) => boolean;
  columnVisibility: Record<string, boolean>;
}

export function TransactionMonthSection({
  monthKey,
  transactions,
  globalSelection,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  isRowPending,
  columnVisibility,
}: Props) {
  const router = useRouter();
  const date = parseISO(`${monthKey}-01`);

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions],
  );

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
      router.push(`${window.location.pathname}?${params.toString()}` as never);
    },
    [router],
  );

  const rowSelection = useMemo(() => {
    return Object.fromEntries(
      transactions.map((t) => [t.id, globalSelection.has(t.id)]),
    );
  }, [transactions, globalSelection]);

  const handleSelectionChange = useCallback(
    (selectedRowIds: Record<string, boolean>) => {
      const newSelection = new Set(globalSelection);
      transactions.forEach((tx) => {
        if (selectedRowIds[tx.id]) newSelection.add(tx.id);
        else newSelection.delete(tx.id);
      });
      onSelectionChange(newSelection);
    },
    [transactions, globalSelection, onSelectionChange],
  );

  return (
    <div>
      {/* Month Header — sticky at top: 0 */}
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

      <DataTable
        columns={transactionColumns({ onView, onEdit, onDelete, isRowPending })}
        data={transactions}
        pagination="none"
        noScroll
        headerClassName="sticky top-[53.6px] z-20 backdrop-blur-xl bg-muted drop-shadow-lg dark:bg-secondary"
        rowIdKey="id"
        getRowClassName={(row: Transaction) =>
          [
            row.isAnomaly ? "border-l-2 border-l-destructive" : "",
            isRowPending(row.id) ? "pointer-events-none opacity-50" : "",
          ]
            .filter(Boolean)
            .join(" ")
        }
        externalRowSelection={rowSelection}
        onRowSelectionChange={handleSelectionChange}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
