"use client";

import { cn } from "@orra/ui/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatAmount } from "@/lib/utils";

interface Props {
  current: number;
  previous: number;
  percentChange: number | null;
}

export function ComparisonCard({ current, previous, percentChange }: Props) {
  const isUp = percentChange !== null && percentChange > 0;
  const isDown = percentChange !== null && percentChange < 0;

  return (
    <div className="rounded-2xl w-full border border-border p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">This period</p>
          <p className="text-lg font-semibold">{formatAmount(current)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Previous period</p>
          <p className="text-lg font-semibold text-muted-foreground">
            {formatAmount(previous)}
          </p>
        </div>
      </div>
      {percentChange !== null && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs font-medium",
            isUp && "text-destructive",
            isDown && "text-emerald-500",
          )}
        >
          {isUp && <TrendingUp className="size-3.5" />}
          {isDown && <TrendingDown className="size-3.5" />}
          <span>
            {Math.abs(percentChange)}%{" "}
            {isUp ? "more" : isDown ? "less" : "unchanged"} than last period
          </span>
        </div>
      )}
    </div>
  );
}
