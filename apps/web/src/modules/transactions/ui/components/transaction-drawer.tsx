"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@neuralpay/ui/components/sheet";
import { Button } from "@neuralpay/ui/components/button";
import { Badge } from "@neuralpay/ui/components/badge";
import { Separator } from "@neuralpay/ui/components/separator";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { ScrollArea } from "@neuralpay/ui/components/scroll-area";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatAmount } from "@/lib/utils";
import { useTransactionDetail } from "@/hooks/transactions/use-transactions";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import type { TransactionDrawerMode } from "@/modules/transactions/types";
import {
  Receipt,
  Trash2,
  Ban,
  Sparkles,
  Pencil,
  Building2,
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  CreditCard,
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import type { Transaction } from "@neuralpay/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSourceMeta(tx: Transaction): {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "secondary" | "outline" | "ghost";
} {
  if (tx.isManual) {
    return {
      label: "Manual Entry",
      icon: <Pencil className="size-3" />,
      variant: "outline",
    };
  }
  if (tx.plaidTxId) {
    return {
      label: "Plaid",
      icon: <Landmark className="size-3" />,
      variant: "secondary",
    };
  }
  if (tx.monoTxId) {
    return {
      label: "Mono",
      icon: <Building2 className="size-3" />,
      variant: "secondary",
    };
  }
  if (tx.csvImportId) {
    return {
      label: "CSV Import",
      icon: <FileText className="size-3" />,
      variant: "ghost",
    };
  }
  return {
    label: "Unknown",
    icon: <Wallet className="size-3" />,
    variant: "ghost",
  };
}

function getStatusColor(status: string): string {
  switch (status) {
    case "successful":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "refunded":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "reversed":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getCategoryIcon(category: string | null): React.ReactNode {
  // You can map these to actual lucide icons based on your CATEGORY_ICONS constant
  return <Tag className="size-4 text-muted-foreground" />;
}

// ─── Detail Field Component ──────────────────────────────────────────────────

function DetailField({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      {icon && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface TransactionDrawerProps {
  transactionId: string | null;
  mode: TransactionDrawerMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDrawer({
  transactionId,
  mode,
  open,
  onOpenChange,
}: TransactionDrawerProps) {
  const { handleDelete, handleExclude, isDeleting, isExcluding } =
    useTransactionMutations();

  // For edit/add modes, you'd use a form hook. Here we focus on view mode.
  const { transaction, isLoading } = useTransactionDetail(transactionId ?? "");

  const tx = transaction;

  const isManual = tx?.isManual ?? false;
  const isSynced = !isManual && !!(tx?.plaidTxId || tx?.monoTxId);
  const isAnomaly = tx?.isAnomaly ?? false;
  const isIncome = tx?.type === "credit";

  const sourceMeta = tx ? getSourceMeta(tx) : null;

  // Generate a receipt-style ID
  const receiptId = useMemo(() => {
    if (!tx) return null;
    const shortId = tx.id.slice(-8).toUpperCase();
    return `#TRX-${shortId}`;
  }, [tx]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg border-l border-border bg-background">
        {isLoading || !tx ? (
          <TransactionDrawerSkeleton />
        ) : (
          <>
            {/* ─── Header / Receipt Top ────────────────────────────────────── */}
            <SheetHeader className="space-y-4 pb-4 pt-2">
              {/* Receipt ID Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="size-5 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {receiptId}
                  </span>
                </div>
                {sourceMeta && (
                  <Badge
                    variant={sourceMeta.variant}
                    className="gap-1.5 text-[10px] font-medium"
                  >
                    {sourceMeta.icon}
                    {sourceMeta.label}
                  </Badge>
                )}
              </div>

              {/* Amount — Hero Display */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {isIncome ? (
                    <ArrowDownLeft className="size-5 text-emerald-500" />
                  ) : (
                    <ArrowUpRight className="size-5 text-foreground" />
                  )}
                  <span
                    className={cn(
                      "text-3xl font-bold tracking-tight tabular-nums",
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground",
                    )}
                  >
                    {isIncome ? "+" : "−"}
                    {formatAmount(Math.abs(Number(tx.amount)))}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {tx.merchant ?? tx.description}
                </p>
              </div>

              {/* Status + Anomaly Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    getStatusColor(tx.status),
                  )}
                >
                  {tx.status}
                </Badge>
                {isAnomaly && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-destructive/20 bg-destructive/10 text-[10px] font-semibold text-destructive"
                  >
                    <AlertTriangle className="size-3" />
                    Flagged
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] capitalize">
                  {tx.type}
                </Badge>
              </div>
            </SheetHeader>

            <Separator />

            {/* ─── Scrollable Body ─────────────────────────────────────────── */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-1 py-4">
                {/* Date & Time */}
                <DetailField
                  label="Date & Time"
                  value={format(
                    new Date(tx.date),
                    "EEEE, MMMM do, yyyy 'at' h:mm a",
                  )}
                  icon={<Calendar className="size-4 text-muted-foreground" />}
                />
                <Separator />

                {/* Bank Account */}
                <DetailField
                  label="Bank Account"
                  value={
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {tx.bankAccount?.name ?? "Unknown Account"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tx.bankAccount?.bankName} • {tx.bankAccount?.type}
                      </span>
                    </div>
                  }
                  icon={<CreditCard className="size-4 text-muted-foreground" />}
                />
                <Separator />

                {/* Category */}
                <DetailField
                  label="Category"
                  value={
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(tx.category)}
                      <span className="font-medium">
                        {tx.customCategory?.name ??
                          tx.category ??
                          "Uncategorized"}
                      </span>
                      {tx.customCategory && (
                        <Badge variant="secondary" className="text-[10px]">
                          Custom
                        </Badge>
                      )}
                    </div>
                  }
                  icon={<Tag className="size-4 text-muted-foreground" />}
                />
                <Separator />

                {/* Description */}
                <DetailField
                  label="Description"
                  value={tx.description}
                  icon={<FileText className="size-4 text-muted-foreground" />}
                />
                <Separator />

                {/* Merchant */}
                {tx.merchant && tx.merchant !== tx.description && (
                  <>
                    <DetailField
                      label="Merchant"
                      value={tx.merchant}
                      icon={
                        <Building2 className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                  </>
                )}

                {/* Notes */}
                {tx.notes && (
                  <>
                    <DetailField
                      label="Notes"
                      value={
                        <span className="italic text-muted-foreground">
                          {tx.notes}
                        </span>
                      }
                      icon={
                        <FileText className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                  </>
                )}

                {/* Source IDs (for synced transactions) */}
                {isSynced && (
                  <>
                    <DetailField
                      label="Source Reference"
                      value={
                        <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
                          {tx.plaidTxId && <span>Plaid: {tx.plaidTxId}</span>}
                          {tx.monoTxId && <span>Mono: {tx.monoTxId}</span>}
                          {tx.csvImportId && (
                            <span>
                              CSV Import: {tx.csvImportId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      }
                      icon={
                        <Landmark className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                  </>
                )}

                {/* Anomaly Score */}
                {isAnomaly && tx.anomalyScore && (
                  <>
                    <DetailField
                      label="Anomaly Score"
                      value={
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-accent">
                            <div
                              className="h-full rounded-full bg-destructive transition-all"
                              style={{
                                width: `${Number(tx.anomalyScore) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-destructive">
                            {(Number(tx.anomalyScore) * 100).toFixed(1)}%
                          </span>
                        </div>
                      }
                      icon={
                        <AlertTriangle className="size-4 text-destructive" />
                      }
                    />
                    <Separator />
                  </>
                )}

                {/* Transaction Tags */}
                {tx.tags && tx.tags.length > 0 && (
                  <>
                    <DetailField
                      label="Tags"
                      value={
                        <div className="flex flex-wrap gap-1.5">
                          {tx.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-[10px]"
                              style={{
                                backgroundColor: tag.color + "20",
                                color: tag.color,
                                borderColor: tag.color + "30",
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      }
                      icon={<Tag className="size-4 text-muted-foreground" />}
                    />
                    <Separator />
                  </>
                )}

                {/* Timestamps */}
                <DetailField
                  label="Created"
                  value={format(
                    new Date(tx.createdAt),
                    "MMM do, yyyy 'at' h:mm a",
                  )}
                  icon={<Calendar className="size-4 text-muted-foreground" />}
                />
              </div>
            </ScrollArea>

            <Separator />

            {/* ─── Footer Actions ──────────────────────────────────────────── */}
            <SheetFooter className="flex-col gap-2 pt-4 pb-2">
              {/* Primary: Generate Insight */}
              <Button
                className="w-full gap-2"
                onClick={() => {
                  // Route to AI chat with transaction context
                  window.location.href = `/dashboard/ai-chat?contextType=transaction&contextId=${tx.id}`;
                }}
              >
                <Sparkles className="size-4" />
                Generate Insight
              </Button>

              {/* Secondary: Edit (all if manual, limited if synced) */}
              {mode === "view" && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    // Switch to edit mode within the same drawer
                    // or open edit drawer — implementation depends on your state flow
                  }}
                >
                  <Pencil className="size-4" />
                  {isManual ? "Edit Transaction" : "Edit Category & Notes"}
                </Button>
              )}

              {/* Destructive: Delete or Exclude */}
              {isManual ? (
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(tx.id)}
                  disabled={isDeleting(tx.id)}
                >
                  {isDeleting(tx.id) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {isDeleting(tx.id) ? "Deleting..." : "Delete Transaction"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => handleExclude(tx.id)}
                  disabled={isExcluding(tx.id)}
                >
                  {isExcluding(tx.id) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Ban className="size-4" />
                  )}
                  {isExcluding(tx.id)
                    ? "Excluding..."
                    : "Exclude from Analysis"}
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TransactionDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Separator />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-2">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
