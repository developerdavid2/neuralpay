"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";
import { cn } from "@neuralpay/ui/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatAmount, formatDate } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../../constants";

export function RecentTransactions() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.payments.transactions.list.queryOptions({ limit: 7 }),
  );

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Recent Transactions
        </h2>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_140px_100px_100px] gap-4 border-b border-border px-5 py-2.5">
        {["Description", "Category", "Date", "Amount"].map((col) => (
          <span
            key={col}
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {data.items.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        )}
        {data.items.map((tx) => (
          <div
            key={tx.id}
            className={cn(
              "grid grid-cols-[1fr_140px_100px_100px] gap-4 px-5 py-3.5",
              "hover:bg-muted/40 transition-colors",
              tx.isAnomaly && "border-l-2 border-l-destructive",
            )}
          >
            {/* Description */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {tx.merchant ?? tx.description}
              </span>
              {tx.isAnomaly && (
                <span className="text-[11px] font-medium text-destructive">
                  ⚠ Flagged anomaly
                </span>
              )}
            </div>

            {/* Category */}
            <span
              className={cn(
                "self-center rounded-full px-2.5 py-0.5 text-[11px] font-medium w-fit",
                CATEGORY_COLORS[tx.category ?? "other"] ??
                  CATEGORY_COLORS.other,
              )}
            >
              {CATEGORY_LABELS[tx.category ?? "other"] ?? "Other"}
            </span>

            {/* Date */}
            <span className="self-center text-xs text-muted-foreground">
              {formatDate(tx.date)}
            </span>

            {/* Amount */}
            <span
              className={cn(
                "self-center font-mono text-sm font-semibold",
                tx.type === "credit" ? "text-[#0EA5A0]" : "text-foreground",
              )}
            >
              {formatAmount(+tx.amount, tx.type)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
