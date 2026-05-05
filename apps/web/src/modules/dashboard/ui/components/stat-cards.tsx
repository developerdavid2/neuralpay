"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { cn } from "@neuralpay/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

export function StatCards() {
  const trpc = useTRPC();

  const { data: balanceData } = useSuspenseQuery(
    trpc.payments.accounts.totalBalance.queryOptions(),
  );
  const { data: accounts } = useSuspenseQuery(
    trpc.payments.accounts.list.queryOptions(),
  );
  const { data: monthSpending } = useSuspenseQuery(
    trpc.payments.transactions.currentMonthSpending.queryOptions(),
  );

  const totalBalance = balanceData.totalBalance;
  const accountCount = balanceData.accountCount;
  const savingsAccount = accounts.find((a) => a.type === "savings");
  const savingsBalance = parseFloat(savingsAccount?.balance ?? "0");
  const savingsRate =
    totalBalance > 0 ? ((savingsBalance / totalBalance) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {card.label}
            </span>
            <span className={cn("rounded-lg p-2", card.iconBg)}>
              <card.icon className={cn("size-4", card.accent)} />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {card.value}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              card.up ? "text-[#0EA5A0]" : "text-destructive",
            )}
          >
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
