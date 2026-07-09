"use client";

import { useConfirm } from "@/hooks/ui/use-confirm";
import { formatAmount } from "@/lib/utils";
import { useTransactionMutations } from "@/modules/transactions/hooks/mutations/use-transaction-mutations";
import { useTransactionDetail } from "@/modules/transactions/hooks/queries/use-transaction-detail";
import { useTransactionUrlSync } from "@/modules/transactions/hooks/use-transaction-url-sync";
import { Button } from "@neuralpay/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { ScrollArea } from "@neuralpay/ui/components/scroll-area";
import { Separator } from "@neuralpay/ui/components/separator";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  Pencil,
  Receipt,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { isSyncedSource } from "../../lib/utils";
import {
  useTransactionDrawer,
  type TransactionDrawerMode,
} from "../../hooks/store/use-transaction-drawer";
import { SourceBadge, StatusBadge } from "./transaction-badges";
import { CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { useTransactionPendingSelectors } from "../../hooks/store/use-transaction-pending";

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

export function TransactionViewDrawer() {
  const { isOpen, mode, onClose, transactionId, onOpenEdit } =
    useTransactionDrawer();
  const { clearUrl, syncToUrl } = useTransactionUrlSync();

  if (!isOpen || mode !== "view" || transactionId === null) return null;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearUrl();
          onClose();
        }
      }}
    >
      <DrawerContent
        className="
          data-[vaul-drawer-direction=right]:inset-y-0 
          data-[vaul-drawer-direction=right]:right-0 
          data-[vaul-drawer-direction=right]:h-full 
          data-[vaul-drawer-direction=right]:w-full 
          data-[vaul-drawer-direction=right]:max-w-105
          flex flex-col
        "
      >
        <DrawerTitle />
        <TransactionViewInner
          transactionId={transactionId}
          onClose={onClose}
          clearUrl={clearUrl}
          onOpenEdit={onOpenEdit}
          syncToUrl={syncToUrl}
        />
      </DrawerContent>
    </Drawer>
  );
}

function TransactionViewInner({
  transactionId,
  onClose,
  clearUrl,
  onOpenEdit,
  syncToUrl,
}: {
  transactionId: string;
  onClose: () => void;
  clearUrl: () => void;
  onOpenEdit: (id: string) => void;
  syncToUrl: (mode: TransactionDrawerMode, id: string) => void;
}) {
  const { transaction, isLoading } = useTransactionDetail(transactionId);
  const { handleDelete } = useTransactionMutations();
  const { isDeleting } = useTransactionPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();

  const deleting = isDeleting(transactionId);

  if (isLoading || !transaction) {
    return (
      <>
        <ConfirmDialog />
        <TransactionViewSkeleton
          onClose={() => {
            clearUrl();
            onClose();
          }}
        />
      </>
    );
  }

  const tx = transaction;
  const isSynced = isSyncedSource(tx);
  const isAnomaly = tx.isAnomaly ?? false;
  const isIncome = tx.type === "credit";
  const receiptId = `#TRX-${tx.id.slice(-8).toUpperCase()}`;

  const onDelete = async () => {
    const ok = await confirm({
      title: "Delete transaction",
      message:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await handleDelete(tx.id);
      clearUrl();
      onClose();
    } catch {}
  };

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "relative flex flex-1 flex-col min-h-0",
          deleting && "pointer-events-none",
        )}
      >
        {deleting && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <DrawerHeader className="px-6 py-4 border-b space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-5 text-muted-foreground" />
              <span className="font-mono text-xs font-medium text-muted-foreground">
                {receiptId}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!isSynced && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={deleting}
                  onClick={() => {
                    syncToUrl("edit", tx.id);
                    onOpenEdit(tx.id);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={deleting}
                  onClick={() => {
                    clearUrl();
                    onClose();
                  }}
                >
                  <X className="size-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>

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

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tx.status} />
            {isAnomaly && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="size-3" />
                Flagged
              </span>
            )}
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
              {tx.type}
            </span>
            <SourceBadge tx={tx} variant="badge" />
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6 no-scrollbar overflow-y-auto">
          <div className="space-y-1 py-4">
            <DetailField
              label="Date & Time"
              value={format(
                new Date(tx.date),
                "EEEE, MMMM do, yyyy 'at' h:mm a",
              )}
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
            <Separator />
            <DetailField
              label="Bank Account"
              value={
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {tx.bankAccountName ?? "Unknown Account"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tx.bankName} • {tx.bankAccountType}
                  </span>
                </div>
              }
              icon={<CreditCard className="size-4 text-muted-foreground" />}
            />
            <Separator />
            <DetailField
              label="Category"
              value={
                <span className="font-medium capitalize">
                  {CATEGORY_LABELS[tx.category ?? "other"]}
                </span>
              }
              icon={<Tag className="size-4 text-muted-foreground" />}
            />
            <Separator />
            <DetailField
              label="Description"
              value={tx.description}
              icon={<FileText className="size-4 text-muted-foreground" />}
            />
            <Separator />
            {tx.merchant && tx.merchant !== tx.description && (
              <>
                <DetailField
                  label="Merchant"
                  value={tx.merchant}
                  icon={<Building2 className="size-4 text-muted-foreground" />}
                />
                <Separator />
              </>
            )}
            {tx.notes && (
              <>
                <DetailField
                  label="Notes"
                  value={
                    <span className="italic text-muted-foreground">
                      {tx.notes}
                    </span>
                  }
                  icon={<FileText className="size-4 text-muted-foreground" />}
                />
                <Separator />
              </>
            )}
            {isSynced && (
              <>
                <DetailField
                  label="Source Reference"
                  value={
                    <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
                      {tx.plaidTxId && <span>Plaid: {tx.plaidTxId}</span>}
                      {tx.monoTxId && <span>Mono: {tx.monoTxId}</span>}
                    </div>
                  }
                  icon={<FileText className="size-4 text-muted-foreground" />}
                />
                <Separator />
              </>
            )}
            {isAnomaly && tx.anomalyScore && (
              <>
                <DetailField
                  label="Anomaly Score"
                  value={
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-accent">
                        <div
                          className="h-full rounded-full bg-destructive transition-all"
                          style={{ width: `${Number(tx.anomalyScore) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-destructive">
                        {(Number(tx.anomalyScore) * 100).toFixed(1)}%
                      </span>
                    </div>
                  }
                  icon={<AlertTriangle className="size-4 text-destructive" />}
                />
                <Separator />
              </>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="px-6 py-4 border-t space-y-2 shrink-0">
          <Button
            className="w-full gap-2"
            disabled={deleting}
            onClick={() => {
              window.location.href = `/dashboard/ai-chat?contextType=transaction&contextId=${tx.id}`;
            }}
          >
            <Sparkles className="size-4" />
            Generate Insight
          </Button>
          {!isSynced && (
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? "Deleting..." : "Delete Transaction"}
            </Button>
          )}
        </DrawerFooter>
      </div>
    </>
  );
}

function TransactionViewSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-4 border-b space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-sm" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-1 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-start gap-3 py-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              {i < 5 && <Separator />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t space-y-3 shrink-0">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <DrawerClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-4 size-8 opacity-0"
          onClick={onClose}
          tabIndex={-1}
        >
          <X className="size-4" />
        </Button>
      </DrawerClose>
    </>
  );
}
