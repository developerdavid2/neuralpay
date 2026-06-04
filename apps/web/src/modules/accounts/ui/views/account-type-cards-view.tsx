"use client";

import { useAccountAggregates } from "@/hooks/accounts/use-account-aggregates";
import { ACCOUNT_TYPES } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Eye, EyeOff } from "lucide-react";
import { useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@neuralpay/ui/components/carousel";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatAmount } from "@/lib/utils";
import { AccountTypeCard } from "../components/account-type-card";
import { NewAccountButton } from "../components/new-account-button";

function TotalCard({
  totalBalance,
  totalCount,
  isBalanceVisible,
  onToggleVisibility,
}: {
  totalBalance: number;
  totalCount: number;
  isBalanceVisible: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card",
        "border border-white/[0.06] drop-shadow-xl",
        "p-6",
      )}
    >
      <div className="relative z-10 flex items-center justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-muted-foreground uppercase tracking-widest">
              Net worth
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleVisibility}
              className="shrink-0 transition-colors"
            >
              {isBalanceVisible ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
              <span className="sr-only">
                {isBalanceVisible ? "Hide balances" : "Show balances"}
              </span>
            </Button>
          </div>

          <p
            className={cn(
              "text-4xl font-bold text-foreground tabular-nums tracking-tight transition-all duration-300",
              !isBalanceVisible && "select-none",
            )}
          >
            {isBalanceVisible ? formatAmount(totalBalance) : "$ ••••"}
          </p>
          <p className="font-mono text-sm text-muted-foreground/70 capitalize">
            {totalCount} {totalCount === 1 ? "ACCOUNT" : "ACCOUNTS"}
          </p>
        </div>

        <NewAccountButton />
      </div>
    </div>
  );
}

export function AccountTypeCardsView() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { aggAccType, totalBalance, aggregateMap, totalCount } =
    useAccountAggregates();

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useState(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  });

  const toggleVisibility = useCallback(() => {
    setIsBalanceVisible((v) => !v);
  }, []);

  return (
    <div className="space-y-4">
      <TotalCard
        totalBalance={totalBalance}
        totalCount={totalCount}
        isBalanceVisible={isBalanceVisible}
        onToggleVisibility={toggleVisibility}
      />

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
          skipSnaps: false,
          dragFree: true,
        }}
        className="w-full rounded-2xl overflow-hidden"
      >
        <CarouselContent className="-ml-3">
          {ACCOUNT_TYPES.map((type) => {
            const agg = aggregateMap.get(type);
            return (
              <CarouselItem
                key={type}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <AccountTypeCard
                  type={type}
                  totalBalance={agg?.totalBalance ?? 0}
                  accountCount={agg?.accountCount ?? 0}
                  isBalanceVisible={isBalanceVisible}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation — only show when scrollable */}
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-3 transition-opacity duration-200",
            !canScrollPrev && !canScrollNext && "opacity-0 pointer-events-none",
          )}
        >
          <CarouselPrevious
            className={cn(
              "relative inset-0 translate-x-0 translate-y-0 h-7 w-7 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
              !canScrollPrev && "opacity-30 cursor-not-allowed",
            )}
          />
          <CarouselNext
            className={cn(
              "relative inset-0 translate-x-0 translate-y-0 h-7 w-7 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
              !canScrollNext && "opacity-30 cursor-not-allowed",
            )}
          />
        </div>
      </Carousel>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function AccountTypeCardsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Total card skeleton */}
      <div className="rounded-2xl bg-muted animate-pulse h-[88px]" />

      {/* Carousel skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] flex-1 rounded-2xl aspect-[1.586/1] bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
