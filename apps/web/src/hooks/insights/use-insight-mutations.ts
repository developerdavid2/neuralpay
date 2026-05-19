import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect } from "react";
import type { Insight } from "@/modules/insights/types";

export function useInsightMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Mutations ──
  const dismiss = useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.recent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.list.queryKey(),
      });
    },
  });

  const restore = useMutation({
    ...trpc.ai.insights.restore.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.recent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.list.queryKey(),
      });
    },
  });

  const markRead = useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.recent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.list.queryKey(),
      });
    },
  });

  // ── Drawer State (full page only) ──
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Handlers ──
  const handleDismiss = useCallback(
    (id: string) => {
      dismiss.mutate({ id });
      if (selectedInsight?.id === id) {
        setDrawerOpen(false);
        setSelectedInsight(null);
      }
    },
    [dismiss, selectedInsight],
  );

  const handleRestore = useCallback(
    (id: string) => restore.mutate({ id }),
    [restore],
  );

  const handleMarkRead = useCallback(
    (id: string) => markRead.mutate({ id }),
    [markRead],
  );

  // Opens the drawer for an insight
  const handleCardOpen = useCallback(
    (insight: Insight) => {
      setSelectedInsight(insight);
      setDrawerOpen(true);
      handleMarkRead(insight.id);
    },
    [handleMarkRead], // handleMarkRead is stable via useCallback
  );

  return {
    // Mutations
    handleDismiss,
    handleRestore,
    handleMarkRead,
    // Drawer
    selectedInsight,
    drawerOpen,
    setDrawerOpen,
    handleCardOpen,
    // Loading states
    isDismissing: dismiss.isPending,
    isRestoring: restore.isPending,
    isMarkingRead: markRead.isPending,
  };
}
