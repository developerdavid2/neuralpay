"use client";

import Link from "next/link";

import { useRecentInsights } from "@/hooks/insights/use-insights";

import {
  EmptyState,
  InsightCard,
  InsightsSkeleton,
} from "@/modules/insights/ui/components/insight-card";
import { ArrowUpRight } from "lucide-react";
import { useRecentInsightNavigation } from "@/hooks/insights/use-recent-insight-navigation";

export function RecentInsights() {
  const { insights, isLoading } = useRecentInsights();
  const { handleDismiss, handleOpen, handleChat, isDismissing } =
    useRecentInsightNavigation();

  const hasInsights = insights.length > 0;

  if (isLoading) {
    return <RecentInsightsSkeleton />;
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
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
          className="flex items-center gap-1 text-xs font-medium text-main hover:underline"
        >
          View all
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Body — fills remaining height, scrolls if overflow */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="flex flex-col divide-y divide-border">
          {!hasInsights ? (
            <EmptyState />
          ) : (
            insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                variant="compact"
                onDismiss={handleDismiss}
                onChat={handleChat}
                onOpen={handleOpen}
                isDismissing={isDismissing}
                isRestoring={() => false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentInsightsSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden h-full min-h-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <InsightsSkeleton />
      </div>
    </div>
  );
}
