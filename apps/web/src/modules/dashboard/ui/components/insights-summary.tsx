"use client";

import { useInsights } from "@/hooks/dashboard/use-insights";
import { cn } from "@neuralpay/ui/lib/utils";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { INSIGHTS_TYPE_LABELS, INSIGHTS_TYPE_STYLES } from "../../constants";

export function InsightsSummary() {
  const { insights, dismiss } = useInsights();

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
        <Link
          href="/dashboard/ai-insights"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Insights */}
      <div className="flex flex-col divide-y divide-border">
        {insights.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No insights yet. Insights are generated as you spend.
          </p>
        )}

        {insights.map((insight) => (
          <div key={insight.id} className="flex flex-col gap-2 px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  INSIGHTS_TYPE_STYLES[insight.type] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                {INSIGHTS_TYPE_LABELS[insight.type] ?? insight.type}
              </span>
              <button
                onClick={() => dismiss.mutate({ id: insight.id })}
                disabled={dismiss.isPending}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                aria-label="Dismiss insight"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground">
              {insight.title}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
