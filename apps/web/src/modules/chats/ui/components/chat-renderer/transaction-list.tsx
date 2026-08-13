"use client";

import { format } from "date-fns";
import { formatAmount } from "@/lib/utils";

interface TransactionItem {
  id?: string;
  description: string;
  merchant?: string | null;
  amount: string | number;
  category?: string | null;
  type: "debit" | "credit";
  date: string | Date;
}

export function TransactionList({ data }: { data: TransactionItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
      {data.map((tx, i) => (
        <div
          key={tx.id ?? i}
          className="flex items-center justify-between gap-3 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {tx.merchant || tx.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(tx.date), "MMM d")}
              {tx.category ? ` · ${tx.category}` : ""}
            </p>
          </div>
          <span
            className={
              tx.type === "credit"
                ? "text-sm font-semibold text-emerald-500 shrink-0"
                : "text-sm font-semibold shrink-0"
            }
          >
            {tx.type === "credit" ? "+" : "-"}
            {formatAmount(Math.abs(Number(tx.amount)))}
          </span>
        </div>
      ))}
    </div>
  );
}
