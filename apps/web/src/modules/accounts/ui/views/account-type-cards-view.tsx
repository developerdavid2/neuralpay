"use client";

import { useAccountAggregates } from "@/hooks/accounts/use-account-aggregates";
import { ACCOUNT_TYPES } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AccountTypeCard, TotalCard } from "../components/account-type-card";

export function AccountTypeCardsView() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { aggAccType, totalBalance, aggregateMap, totalCount } =
    useAccountAggregates();

  return (
    <div className="space-y-4">
      <TotalCard
        totalBalance={totalBalance}
        totalCount={totalCount}
        isBalanceVisible={isBalanceVisible}
        setIsBalanceVisible={setIsBalanceVisible}
      />

      {/* Cards — 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACCOUNT_TYPES.map((type) => {
          const agg = aggregateMap.get(type);
          return (
            <AccountTypeCard
              key={type}
              type={type}
              totalBalance={agg?.totalBalance ?? 0}
              accountCount={agg?.accountCount ?? 0}
              isBalanceVisible={isBalanceVisible}
            />
          );
        })}
      </div>
    </div>
  );
}

export function AccountTypeCardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl aspect-[1.586/1] bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
