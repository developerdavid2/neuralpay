"use client";

import type { BudgetHealth } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
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
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Landmark,
  Pencil,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { formatAmount } from "@/lib/utils";
import { ACCOUNT_STATUS_CONFIG } from "@/modules/accounts/constants";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { HEALTH_META } from "../../constants";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import {
  type BudgetDrawerMode,
  useBudgetDrawer,
} from "../../hooks/store/use-budget-drawer";
import { useBudgetPendingSelectors } from "../../hooks/store/use-budget-pending";
import { useBudgetUrlSync } from "../../hooks/use-budget-url-sync";

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

function barStatusFor(percentUsed: number, threshold: number): BudgetHealth {
  if (percentUsed >= 100) return "over";
  if (percentUsed >= threshold) return "warning";
  return "on_track";
}

export function BudgetViewDrawer() {
  const { isOpen, mode, onClose, budgetId, onOpenEdit } = useBudgetDrawer();
  const { clearUrl, setUrl } = useBudgetUrlSync();

  if (!isOpen || mode !== "view" || budgetId === null) return null;

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
      <DrawerContent className="data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-xl flex flex-col max-w-140!">
        <DrawerTitle className="sr-only">Budget Details</DrawerTitle>
        <BudgetViewInner
          budgetId={budgetId}
          onClose={onClose}
          clearUrl={clearUrl}
          onOpenEdit={onOpenEdit}
          setUrl={setUrl}
        />
      </DrawerContent>
    </Drawer>
  );
}

function BudgetViewInner({
  budgetId,
  onClose,
  clearUrl,
  onOpenEdit,
  setUrl,
}: {
  budgetId: string;
  onClose: () => void;
  clearUrl: () => void;
  onOpenEdit: (id: string) => void;
  setUrl: (mode: BudgetDrawerMode, id: string) => void;
}) {
  const { budget, isLoading } = useBudgetDetail(budgetId ?? "");
  const { handleDelete } = useBudgetMutations();
  const { isDeleting } = useBudgetPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();

  const deleting = isDeleting(budgetId);
  if (isLoading || !budget) {
    return (
      <>
        <ConfirmDialog />
        <BudgetViewSkeleton
          onClose={() => {
            clearUrl();
            onClose();
          }}
        />
      </>
    );
  }

  const b = budget;
  const health = HEALTH_META[b.status];
  const accent = b?.color ?? "#6366f1";
  const totalPct = b ? clampPercent(b.totalPercentUsed) : 0;
  const limit = b ? Number(b.limitAmount) : 0;

  const onDelete = async () => {
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
      clearUrl();
      onClose();
    } catch {}
  };

  const onAskCoach = () => {
    // TODO: wire to the AI coach once the entry point is available.
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
            <Spinner className="size-6  text-muted-foreground" />
          </div>
        )}

        <DrawerHeader className="px-6 py-4 border-b space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accent}1a`, color: accent }}
            >
              <Wallet className="size-5" />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={deleting}
                onClick={() => {
                  setUrl("edit", b.id);
                  onOpenEdit(b.id);
                }}
              >
                <Pencil className="size-4" />
              </Button>
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

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold tracking-tight">{b.name}</h2>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Spent
            </span>
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {formatAmount(b.totalSpent)}
            </p>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", health.bar)}
                style={{ width: `${totalPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground tabular-nums">
                {Math.round(b.totalPercentUsed)}% of {formatAmount(limit)}
              </span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  b.totalRemaining >= 0 ? "text-muted-foreground" : health.text,
                )}
              >
                {b.totalRemaining >= 0
                  ? `${formatAmount(b.totalRemaining)} remaining`
                  : `${formatAmount(Math.abs(b.totalRemaining))} over budget`}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6 no-scrollbar overflow-y-auto">
          <div className="space-y-5 py-5">
            {/* ── Budget Period ── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Budget Period</h3>
              <div className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium tabular-nums">
                    {format(new Date(b.startDate), "MMM d, yyyy")} –{" "}
                    {format(new Date(b.endDate), "MMM d, yyyy")}
                  </span>
                </div>
                {b.description && (
                  <p className="text-sm text-muted-foreground">
                    {b.description}
                  </p>
                )}
              </div>
            </div>
            {/* ── Budget Health ── */}
            <h3 className="text-sm font-semibold">Budget Health</h3>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={health.badge}>
                  {health.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Days Left</span>
                <span className="text-sm font-medium tabular-nums">
                  {b.daysRemaining > 0
                    ? `${b.daysRemaining} day${b.daysRemaining === 1 ? "" : "s"}`
                    : "Ended"}
                </span>
              </div>
            </div>

            {/* ── Categories ── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Categories ({b.categories.length})
              </h3>
              {b.categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories.</p>
              ) : (
                <div className="space-y-2.5">
                  {b.categories.map((c) => {
                    const Icon = CATEGORY_ICONS[c.category];
                    const catPct = clampPercent(c.percentUsed);
                    const catStatus = barStatusFor(
                      c.percentUsed,
                      b.alertThreshold ?? 80,
                    );
                    return (
                      <div
                        key={c.category}
                        className="rounded-xl border border-border p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                            {Icon && (
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">
                              {CATEGORY_LABELS[c.category] ?? c.category}
                            </span>
                          </span>
                          <span className="text-sm font-semibold tabular-nums shrink-0">
                            {formatAmount(c.spent)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              HEALTH_META[catStatus].bar,
                            )}
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {Math.round(c.percentUsed)}% of{" "}
                          {formatAmount(Number(c.limitAmount))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Tracking Accounts ── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Tracking Accounts ({b.accounts.length})
              </h3>
              {b.accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All accounts</p>
              ) : (
                <div className="space-y-2">
                  {b.accounts.map((a) => {
                    const cfg =
                      ACCOUNT_STATUS_CONFIG[a.isActive ? "active" : "inactive"];
                    return (
                      <div
                        key={a.bankAccountId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Landmark className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">
                            {a.name ?? a.bankName ?? "Account"}
                          </span>
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 uppercase", cfg.color)}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <DrawerFooter className="px-6 py-4 border-t space-y-2 shrink-0">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onAskCoach}
            disabled={deleting}
          >
            <Sparkles className="size-4" />
            Ask AI Coach About This Budget
          </Button>
          <Button
            variant="ghost"
            className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Spinner className="size-4" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleting ? "Deleting..." : "Delete Budget"}
          </Button>
        </DrawerFooter>
      </div>
    </>
  );
}
function BudgetViewSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
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
