"use client";

import Link from "next/link";
import { useInsightMutations } from "@/hooks/insights/use-insight-mutations";
import { useRecentInsights } from "@/hooks/insights/use-insights";

import {
  EmptyState,
  InsightCard,
  InsightsSkeleton,
} from "@/modules/insights/ui/components/insight-card";
import { ArrowUpRight } from "lucide-react";

export function InsightsSummary() {
  const { insights, isLoading } = useRecentInsights();
  const { handleDismiss, handleOpen, handleChat, isDismissing } =
    useInsightMutations();

  const hasInsights = insights.length > 0;

  if (isLoading) {
    return <InsightsSummarySkeleton />;
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
          {hasInsights && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
              {insights.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/ai-insights"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Insights list */}
      <div className="flex flex-col divide-y divide-border">
        {!hasInsights ? (
          <EmptyState />
        ) : (
          insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
              onChat={handleChat}
              onOpen={handleOpen}
              isDismissing={isDismissing}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function InsightsSummarySkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
      </div>
      <InsightsSkeleton />
    </div>
  );
}
