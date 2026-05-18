"use client";

import { useRecentTransactions } from "@/hooks/transactions/use-transactions";
import { formatAmount, formatTransactionDate } from "@/lib/utils";
import type { Transaction } from "@/modules/transactions/types";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import { ArrowUpRight, Package } from "lucide-react";
import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../constants";

function TransactionIcon({ category }: { category: string | null }) {
  const Icon = CATEGORY_ICONS[category ?? "other"] ?? Package;
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
    </span>
  );
}

function TransactionBadges({
  isPending,
  isAnomaly,
}: {
  isPending: boolean;
  isAnomaly: boolean;
}) {
  if (!isPending && !isAnomaly) return null;
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      {isPending && (
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Pending
        </span>
      )}
      {isAnomaly && (
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive">
          Flagged
        </span>
      )}
    </span>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "credit";
  const isPending = tx.status === "pending";
  const isAnomaly = tx.isAnomaly ?? false;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-3.5",
        "transition-colors hover:bg-muted/30",
        isAnomaly && "border-l-2 border-l-destructive",
      )}
    >
      <TransactionIcon category={tx.category} />

      {/* Merchant + date */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">
          {tx.merchant ?? tx.description}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {formatTransactionDate(tx.date)}
        </span>
      </div>

      {/* Category label — hidden on mobile */}
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {CATEGORY_LABELS[tx.category ?? "other"] ?? "Other"}
      </span>

      {/* Status badges + amount */}
      <div className="flex items-center gap-2 shrink-0">
        <TransactionBadges isPending={isPending} isAnomaly={isAnomaly} />
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            isIncome ? "text-green-700 dark:text-green-400" : "text-foreground",
          )}
        >
          {isIncome ? "+" : "−"}
          {formatAmount(Math.abs(Number(tx.amount)))}
        </span>
      </div>
    </div>
  );
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
      <Package className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">No transactions yet.</p>
    </div>
  );
}

export function RecentTransactions() {
  const { recentTransactions } = useRecentTransactions();

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
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

      {/* Body */}
      <div className="divide-y divide-border">
        {recentTransactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          recentTransactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-14" />
          <ArrowUpRight className="size-3 text-muted-foreground/30" />
        </div>
      </CardHeader>

      <CardContent className="divide-y divide-border p-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="hidden h-3 w-16 sm:block" />
            <Skeleton className="h-3.5 w-16 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
