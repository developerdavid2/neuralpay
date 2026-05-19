import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Insight } from "@/modules/insights/types";

export function useInsightMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);

  const dismiss = useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.recent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.list.queryKey(),
      });
      // Invalidate the specific insight detail to refresh stale data
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.getInsightById.queryKey({ id }),
      });
    },
  });

  const restore = useMutation({
    ...trpc.ai.insights.restore.mutationOptions(),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.recent.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.list.queryKey(),
      });
      // Invalidate the specific insight detail to refresh stale data
      queryClient.invalidateQueries({
        queryKey: trpc.ai.insights.getInsightById.queryKey({ id }),
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

  const handleDismiss = useCallback(
    async (id: string) => {
      setPendingDismissId(id);
      await dismiss.mutateAsync({ id });
      setPendingDismissId(null);
    },
    [dismiss],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      setPendingRestoreId(id);
      await restore.mutateAsync({ id });
      setPendingRestoreId(null);
    },
    [restore],
  );

  const handleMarkRead = useCallback(
    async (id: string) => {
      setPendingReadId(id);
      await markRead.mutateAsync({ id });
      setPendingReadId(null);
    },
    [markRead],
  );

  // Drawer state
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardOpen = useCallback(
    (insight: Insight) => {
      setSelectedInsightId(insight.id);
      setDrawerOpen(true);
      handleMarkRead(insight.id);
    },
    [handleMarkRead],
  );

  // Check if a specific insight is pending
  const isDismissing = (id: string) => pendingDismissId === id;
  const isRestoring = (id: string) => pendingRestoreId === id;
  const isMarkingRead = (id: string) => pendingReadId === id;

  return {
    // Mutations
    handleDismiss,
    handleRestore,
    handleMarkRead,
    // Drawer
    selectedInsightId,
    drawerOpen,
    setDrawerOpen,
    handleCardOpen,
    // Per-ID pending states
    isDismissing,
    isRestoring,
    isMarkingRead,
  };
}
