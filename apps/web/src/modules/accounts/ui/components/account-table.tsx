// modules/accounts/ui/account-table.tsx
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useAccountDrawer } from "@/hooks/accounts/use-account-drawer";
import { useAccountMutations } from "@/hooks/accounts/use-account-mutations";
import { useAccountUrlSync } from "@/hooks/accounts/use-account-url-sync";
import { useAccountsList } from "@/hooks/accounts/use-accounts";
import { ACCOUNTS_LIMIT } from "@/modules/accounts/constants";
import type { AccountStatus, AccountType } from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Package } from "lucide-react";
import { useMemo } from "react";

import { AccountTypeCards } from "./account-type-card";
import { AccountTypeCardsSkeleton } from "./account-type-card";
import { useAccountAggregates } from "@/hooks/accounts/use-account-aggregates";

interface Props {
  currentSearch: string;
  currentTypes?: string[];
  currentStatuses?: string[];
  currentIsManual: boolean;
  currentLimit: number;
  focusAccountId?: string;
  focusMode?: string;
}

export function AccountTable({
  currentSearch,
  currentTypes,
  currentStatuses,
  currentIsManual,
  currentLimit,
  focusAccountId,
  focusMode,
}: Props) {
  const { onOpenView, onOpenEdit } = useAccountDrawer();
  const { syncToUrl } = useAccountUrlSync();
  const { handleDelete: runDelete } = useAccountMutations();
  const { aggAccType, isLoading: isAggLoading } = useAccountAggregates();

  const filters = useMemo(
    () => ({
      limit: Math.min(currentLimit || ACCOUNTS_LIMIT, 50),
      search: currentSearch.trim() || undefined,
      type: currentTypes?.length ? (currentTypes as AccountType[]) : undefined,
      status: currentStatuses?.length
        ? (currentStatuses as AccountStatus[])
        : undefined,
      isManual: currentIsManual || undefined,
    }),
    [
      currentSearch,
      currentTypes,
      currentStatuses,
      currentIsManual,
      currentLimit,
    ],
  );

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useAccountsList(filters);

  const allAccounts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const handleView = (account: { id: string }) => {
    onOpenView(account.id);
    syncToUrl("view", account.id);
  };

  const handleEdit = (account: { id: string }) => {
    onOpenEdit(account.id);
    syncToUrl("edit", account.id);
  };

  const handleDelete = async (id: string) => {
    await runDelete(id);
  };

  if (allAccounts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <Package className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">No accounts found</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          You haven't added any accounts yet. Add your first account to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Aggregate Cards */}
      {isAggLoading ? (
        <AccountTypeCardsSkeleton />
      ) : (
        <AccountTypeCards aggregates={aggAccType ?? []} />
      )}

      {/* Accounts List */}
      <div className="px-6 pb-6 overflow-y-auto scrollbar-hide flex-1 min-h-0">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {allAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleView(account)}
              >
                {/* Type Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {account.type.slice(0, 3)}
                  </span>
                </div>

                {/* Account Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium truncate">
                    {account.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {account.bankName ?? "Manual Account"}
                  </span>
                </div>

                {/* Balance */}
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold tabular-nums">
                    {account.balance
                      ? `$${Number(account.balance).toFixed(2)}`
                      : "—"}
                  </span>
                </div>

                {/* Status Badge */}
                <AccountStatusBadge status={account.status} />
              </div>
            ))}
          </div>
        </div>

        <InfiniteScroll
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          isManual={false}
        />
      </div>

      <AccountViewDrawer />
      <AccountFormDrawer />
    </div>
  );
}

export function AccountTableSkeleton() {
  return (
    <div className="space-y-6 px-6 py-4">
      <AccountTypeCardsSkeleton />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
