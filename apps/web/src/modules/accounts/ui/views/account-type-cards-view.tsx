"use client";

import { ACCOUNT_TYPES } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@neuralpay/ui/components/carousel";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatAmount } from "@/lib/utils";
import { AccountTypeCard } from "../components/account-type-card";
import { NewAccountButton } from "../components/new-account-button";
import { useAccountAggregates } from "../../hooks/queries/use-account-aggregates";

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
        "border border-white/6 drop-shadow-xl",
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
      </div>
    </div>
  );
}

export function AccountTypeCardsView() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { totalBalance, aggregateMap, totalCount } = useAccountAggregates();

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const toggleVisibility = useCallback(() => {
    setIsBalanceVisible((v) => !v);
  }, []);

  return (
    <div className="space-y-4 my-6">
      <div className="relative">
        <TotalCard
          totalBalance={totalBalance}
          totalCount={totalCount}
          isBalanceVisible={isBalanceVisible}
          onToggleVisibility={toggleVisibility}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
          <NewAccountButton />
        </div>
      </div>

      <div className="relative">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
            dragFree: true,
          }}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-3">
            {ACCOUNT_TYPES.map((type) => {
              const agg = aggregateMap.get(type);
              return (
                <CarouselItem
                  key={type}
                  className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <AccountTypeCard
                    type={type}
                    totalBalance={Number(agg?.totalBalance) ?? 0}
                    accountCount={agg?.accountCount ?? 0}
                    isBalanceVisible={isBalanceVisible}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <button
          type="button"
          disabled={!canScrollPrev}
          onClick={() => api?.scrollPrev()}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3",
            "z-10 flex items-center justify-center",
            "size-12 rounded-full",
            "bg-black/40 backdrop-blur-sm",
            "border border-border/50",
            "text-muted-foreground hover:text-foreground",
            "shadow-lg shadow-black/20",
            "transition-all duration-200",
            "hover:scale-110 active:scale-95",
            !canScrollPrev && "opacity-0 pointer-events-none scale-90",
          )}
          aria-label="Previous cards"
        >
          <ChevronLeft className="size-6 text-white" />
        </button>

        <button
          type="button"
          disabled={!canScrollNext}
          onClick={() => api?.scrollNext()}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-3",
            "z-10 flex items-center justify-center",
            "size-12 rounded-full",
            "bg-black/40 backdrop-blur-sm",
            "border border-border/50",
            "text-muted-foreground hover:text-foreground",
            "shadow-lg shadow-black/20",
            "transition-all duration-200",
            "hover:scale-110 active:scale-95",
            !canScrollNext && "opacity-0 pointer-events-none scale-90",
          )}
          aria-label="Next cards"
        >
          <ChevronRight className="size-6 text-white" />
        </button>
      </div>
    </div>
  );
}

export function AccountTypeCardsSkeleton() {
  return (
    <div className="space-y-4 my-6">
      {/* Total card skeleton */}
      <div className="rounded-2xl bg-card animate-pulse h-25" />

      {/* Carousel skeleton */}
      <div className="flex gap-3 overflow-hidden ">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3 min-w-70 flex-1 rounded-2xl h-75 bg-card animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
