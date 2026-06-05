// modules/accounts/ui/account-view-drawer.tsx
"use client";

import { useAccountDrawer } from "@/hooks/accounts/use-account-drawer";
import { useAccountMutations } from "@/hooks/accounts/use-account-mutations";
import { useAccountPendingSelectors } from "@/hooks/accounts/use-account-pending";
import { useAccountDetail } from "@/hooks/accounts/use-account-detail";
import { useConfirm } from "@/hooks/use-confirm";
import { formatAmount } from "@/lib/utils";
import { Button } from "@neuralpay/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@neuralpay/ui/components/drawer";
import { ScrollArea } from "@neuralpay/ui/components/scroll-area";
import { Separator } from "@neuralpay/ui/components/separator";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import { format } from "date-fns";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { AccountStatusBadge, AccountTypeBadge } from "./account-badges";
import { useAccountUrlSync } from "@/hooks/accounts/use-account-url-sync";

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
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}

export function AccountViewDrawer() {
  const { isOpen, mode, onClose, accountId, onOpenEdit } = useAccountDrawer();
  const { clearUrl, setUrl } = useAccountUrlSync();
  const { account, isLoading } = useAccountDetail(accountId ?? "");
  const { handleDelete } = useAccountMutations();
  const { isDeleting } = useAccountPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();

  if (!isOpen || mode !== "view" || accountId === null) return null;

  const acc = account;
  const isManual = acc?.isManual ?? true;
  const isSynced = !isManual;
  const deleting = isDeleting(accountId);

  const onDelete = async () => {
    if (!acc) return;
    const ok = await confirm({
      title: "Delete account",
      message:
        "Are you sure you want to delete this account? This will also remove all associated transactions. This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await handleDelete(acc.id);
      clearUrl();
      onClose();
    } catch {
      // Error toast handled in mutation hook
    }
  };

  return (
    <>
      <ConfirmDialog />
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
            data-[vaul-drawer-direction=right]:max-w-[420px]
            flex flex-col
          "
        >
          {isLoading ? (
            <AccountViewDrawerSkeleton onClose={onClose} />
          ) : !acc ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
              <p className="text-sm text-muted-foreground">
                Account not found.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  clearUrl();
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          ) : (
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
              <>
                <DrawerHeader className="px-6 py-4 border-b space-y-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="size-5 text-muted-foreground" />
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        #{acc.id.slice(-8).toUpperCase()}
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
                            setUrl("edit", acc.id);
                            onOpenEdit(acc.id);
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
                    <h2 className="text-2xl font-bold tracking-tight">
                      {acc.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <AccountTypeBadge type={acc.type} />
                      <AccountStatusBadge status={acc.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                      {acc.balance ? formatAmount(Number(acc.balance)) : "—"}
                    </span>
                  </div>
                </DrawerHeader>

                <ScrollArea className="flex-1 px-6 no-scrollbar overflow-y-auto">
                  <div className="space-y-1 py-4">
                    <DetailField
                      label="Bank Name"
                      value={acc.bankName ?? "Manual Account"}
                      icon={
                        <Building2 className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                    <DetailField
                      label="Account Type"
                      value={
                        <span className="capitalize">
                          {acc.type.replace(/_/g, " ")}
                        </span>
                      }
                      icon={
                        <CreditCard className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                    <DetailField
                      label="Status"
                      value={<AccountStatusBadge status={acc.status} />}
                      icon={
                        <AlertTriangle className="size-4 text-muted-foreground" />
                      }
                    />
                    <Separator />
                    {acc.maskedNumber && (
                      <>
                        <DetailField
                          label="Account Number"
                          value={
                            <span className="font-mono text-xs">
                              •••• {acc.maskedNumber.slice(-4)}
                            </span>
                          }
                          icon={
                            <Wallet className="size-4 text-muted-foreground" />
                          }
                        />
                        <Separator />
                      </>
                    )}
                    {acc.currency && (
                      <>
                        <DetailField
                          label="Currency"
                          value={acc.currency.toUpperCase()}
                          icon={
                            <FileText className="size-4 text-muted-foreground" />
                          }
                        />
                        <Separator />
                      </>
                    )}

                    <DetailField
                      label="Created"
                      value={format(
                        new Date(acc.createdAt),
                        "MMM do, yyyy 'at' h:mm a",
                      )}
                      icon={
                        <Calendar className="size-4 text-muted-foreground" />
                      }
                    />
                  </div>
                </ScrollArea>

                <DrawerFooter className="px-6 py-4 border-t space-y-2 shrink-0">
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
                      {deleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  )}
                </DrawerFooter>
              </>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function AccountViewDrawerSkeleton({ onClose }: { onClose: () => void }) {
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
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-1 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-start gap-3 py-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              {i < 4 && <Separator />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t space-y-3 shrink-0">
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
