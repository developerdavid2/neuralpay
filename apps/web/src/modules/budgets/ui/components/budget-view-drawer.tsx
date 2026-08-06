"use client";

import { formatAmount } from "@/lib/utils";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { Badge } from "@neuralpay/ui/components/badge";
import { Button } from "@neuralpay/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@neuralpay/ui/components/drawer";
import { ScrollArea } from "@neuralpay/ui/components/scroll-area";
import { Separator } from "@neuralpay/ui/components/separator";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import { format } from "date-fns";
import {
  CalendarRange,
  Landmark,
  Package,
  Pencil,
  Receipt,
  Trash2,
  X,
} from "lucide-react";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";
import { HEALTH_META } from "../../constants";

function DetailField({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      {icon && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}

export function BudgetViewDrawer() {
  const { isOpen, mode, onClose, budgetId, onOpenEdit } = useBudgetDrawer();
  const { budget, isLoading } = useBudgetDetail(budgetId ?? "");
  const { handleDelete, isDeleting } = useBudgetMutations();
  const [ConfirmDialog, confirm] = useConfirm();

  if (!isOpen || mode !== "view" || budgetId === null) return null;

  const b = budget;
  const Icon = b ? CATEGORY_ICONS[b.category] ?? Package : Package;
  const health = b ? HEALTH_META[b.status] : null;
  const accent = b?.color ?? "#6366f1";
  const pct = b ? Math.min(b.percentUsed, 100) : 0;

  const onDelete = async () => {
    if (!b) return;
    const ok = await confirm({
      title: "Delete budget",
      message:
        "Are you sure you want to delete this budget? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await handleDelete(b.id);
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Drawer
        direction="right"
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-105 flex flex-col">
          {isLoading ? (
            <ViewSkeleton />
          ) : !b ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
              <p className="text-sm text-muted-foreground">Budget not found.</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "relative flex flex-1 flex-col min-h-0",
                isDeleting && "pointer-events-none",
              )}
            >
              {isDeleting && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
                  <Spinner className="size-6 text-muted-foreground" />
                </div>
              )}

              <DrawerHeader className="px-6 py-4 border-b space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accent}1a`, color: accent }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={isDeleting}
                      onClick={() => onOpenEdit(b.id, b)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={isDeleting}
                      onClick={onClose}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {b.name ?? CATEGORY_LABELS[b.category] ?? b.category}
                  </h2>
                  {health && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={health.badge}>
                        {health.label}
                      </Badge>
                      <span className={cn("text-sm font-medium", health.color)}>
                        {b.percentUsed}% used
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                      {formatAmount(b.spent)}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      of {formatAmount(Number(b.limitAmount))}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        health?.bar,
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.remaining >= 0
                      ? `${formatAmount(b.remaining)} remaining`
                      : `${formatAmount(Math.abs(b.remaining))} over budget`}
                  </p>
                </div>
              </DrawerHeader>

              <ScrollArea className="flex-1 px-6 no-scrollbar overflow-y-auto">
                <div className="space-y-1 py-4">
                  <DetailField
                    label="Category"
                    value={CATEGORY_LABELS[b.category] ?? b.category}
                    icon={<Package className="size-4 text-muted-foreground" />}
                  />
                  <Separator />
                  <DetailField
                    label="Period"
                    value={
                      b.startDate && b.endDate
                        ? `${format(new Date(b.startDate), "MMM d, yyyy")} — ${format(
                            new Date(b.endDate),
                            "MMM d, yyyy",
                          )}`
                        : "—"
                    }
                    icon={
                      <CalendarRange className="size-4 text-muted-foreground" />
                    }
                  />
                  <Separator />
                  <DetailField
                    label="Transactions"
                    value={`${b.transactionCount} in this period`}
                    icon={<Receipt className="size-4 text-muted-foreground" />}
                  />
                  <Separator />
                  <DetailField
                    label="Accounts"
                    value={
                      b.accounts.length === 0
                        ? "All accounts"
                        : b.accounts
                            .map((a) => a.name ?? a.bankName ?? "Account")
                            .join(", ")
                    }
                    icon={<Landmark className="size-4 text-muted-foreground" />}
                  />
                  {b.description && (
                    <>
                      <Separator />
                      <DetailField label="Notes" value={b.description} />
                    </>
                  )}
                </div>
              </ScrollArea>

              <DrawerFooter className="px-6 py-4 border-t space-y-2 shrink-0">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete Budget"}
                </Button>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="size-10 rounded-xl" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-2.5 w-full rounded-full" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
