"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useInsightMutations } from "@/hooks/insights/use-insight-mutations";
import { useInsightsList } from "@/hooks/insights/use-insights";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  InsightCard,
  InsightsSkeleton,
  type InsightCardVariant,
} from "@/modules/insights/ui/components/insight-card";

import { Sparkles } from "lucide-react";
import type { Route } from "next";
import { InsightDetails } from "./insight-detail";
import type { Insight } from "../../types";

interface Props {
  focusInsightId?: string;
}

export function InsightsList({ focusInsightId }: Props) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const variant: InsightCardVariant = isMobile ? "compact" : "full";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { insights } = useInsightsList({
    includeDismissed: false,
    limit: 50,
  });

  const {
    handleDismiss,
    handleCardOpen,
    selectedInsight,
    drawerOpen,
    setDrawerOpen,
    isDismissing,
    isRestoring,
  } = useInsightMutations();

  // Auto-open drawer when focusInsightId is in URL
  useEffect(() => {
    if (
      focusInsightId &&
      insights.length > 0 &&
      selectedInsight?.id !== focusInsightId
    ) {
      const target = insights.find((i) => i.id === focusInsightId);
      if (target) {
        handleCardOpen(target);
      }
    }
  }, [focusInsightId, insights, handleCardOpen, selectedInsight?.id]);

  // Open drawer and add focus param to URL
  const handleCardOpenWithURL = useCallback(
    (insight: Insight) => {
      handleCardOpen(insight);
      // Add focus param to URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("focus", insight.id);
      router.replace((pathname + "?" + params.toString()) as Route, {
        scroll: false,
      });
    },
    [handleCardOpen, pathname, router, searchParams],
  );

  // Remove ?focus= from URL when drawer closes
  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);

    if (!open) {
      // Clear focus param from URL without navigation flash
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focus");
      const query = params.toString();
      router.replace((query ? `${pathname}?${query}` : pathname) as Route, {
        scroll: false,
      });
    }
  };

  const filteredInsights = useMemo(() => insights, [insights]);

  if (filteredInsights.length === 0) {
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
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                variant={variant}
                onDismiss={handleDismiss}
                onChat={(id) => {
                  window.location.href = `/dashboard/ai-chat?contextType=insight&contextId=${id}`;
                }}
                onOpen={() => handleCardOpenWithURL(insight)}
                isDismissing={isDismissing}
                isRestoring={isRestoring}
                isFocused={insight.id === focusInsightId}
              />
            ))}
          </div>
        </div>
      </div>

      <InsightDetails
        insight={selectedInsight}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange} // ← custom handler
        onChat={(id) => {
          window.location.href = `/dashboard/ai-chat?contextType=insight&contextId=${id}`;
        }}
        onDismiss={handleDismiss}
        isDismissing={isDismissing}
        isRestoring={isRestoring}
      />
    </>
  );
}
export function InsightsListSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        {/* <h2 className="text-sm font-semibold text-foreground">AI Insights</h2> */}
      </div>
      <InsightsSkeleton />
    </div>
  );
}
