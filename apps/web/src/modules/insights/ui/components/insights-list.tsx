"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useInsightMutations } from "@/modules/insights/hooks/use-insight-mutations";
import { useInsightsList } from "@/modules/insights/hooks/use-insights";
import { useMediaQuery } from "@/hooks/use-media-query";
import { INSIGHTS_LIMIT } from "@/modules/dashboard/constants";
import {
  InsightCard,
  InsightsSkeleton,
  type InsightCardVariant,
} from "@/modules/insights/ui/components/insight-card";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { InsightsListInput } from "../../types";
import { InsightDetails } from "./insight-detail";

interface Props {
  focusInsightId?: string;
  currentSearch?: NonNullable<InsightsListInput["search"]>;
  currentType?: NonNullable<InsightsListInput["type"]>;
  currentSeverity?: NonNullable<InsightsListInput["severity"]>;
  currentShowDismissed: boolean;
  currentReadStatus: string;
}

export function InsightsList({
  focusInsightId,
  currentSearch,
  currentType,
  currentSeverity,
  currentShowDismissed,
  currentReadStatus,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const variant: InsightCardVariant = isMobile ? "compact" : "full";

  // Data + Mutations
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useInsightsList({
      includeDismissed: currentShowDismissed,
      limit: INSIGHTS_LIMIT,
      severity: currentSeverity,
      type: currentType,
      search: currentSearch,
      readStatus: (currentReadStatus as "all" | "read" | "unread") ?? "all",
    });

  const {
    handleDismiss,
    handleCardOpen,
    handleDrawerClose,
    selectedInsightId,
    drawerOpen,
    setDrawerOpen,
    isDismissing,
    isRestoring,
    handleRestore,
  } = useInsightMutations();

  const allInsights = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data.pages],
  );

  // Auto-open drawer when focusInsightId appears in URL
  useEffect(() => {
    if (
      focusInsightId &&
      allInsights.length > 0 &&
      selectedInsightId !== focusInsightId
    ) {
      const target = allInsights.find((i) => i.id === focusInsightId);
      if (target) {
        handleCardOpen(target);
      }
    }
  }, [focusInsightId, allInsights, selectedInsightId, handleCardOpen]);

  if (allInsights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Sparkles className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          No active insights
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Insights are generated as you spend
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-border rounded-xl overflow-hidden">
            {allInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                variant={variant}
                onDismiss={handleDismiss}
                onRestore={handleRestore}
                onChat={(id) => {
                  window.location.href = `/dashboard/ai-chat?contextType=insight&contextId=${id}`;
                }}
                onOpen={() => handleCardOpen(insight)}
                isDismissing={isDismissing}
                isRestoring={isRestoring}
              />
            ))}
          </div>

          <InfiniteScroll
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isLoading={isLoading}
            isManual={true}
          />
        </div>
      </div>

      <InsightDetails
        insightId={selectedInsightId}
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDrawerClose();
          } else {
            setDrawerOpen(true);
          }
        }}
        onChat={(id) => {
          window.location.href = `/dashboard/ai-chat?contextType=insight&contextId=${id}`;
        }}
        onDismiss={handleDismiss}
        onRestore={handleRestore}
        isDismissing={isDismissing}
        isRestoring={isRestoring}
      />
    </>
  );
}

export function InsightsListSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4" />
      <InsightsSkeleton />
    </div>
  );
}
