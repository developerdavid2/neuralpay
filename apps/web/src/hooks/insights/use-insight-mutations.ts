import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Insight } from "@/modules/insights/types";
import { queryKeys } from "@/lib/queryKeys";

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
        queryKey: queryKeys.insights.recent(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.lists(),
      });
      // Invalidate the specific insight detail to refresh stale data
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.detail(id),
      });
    },
  });

  const restore = useMutation({
    ...trpc.ai.insights.restore.mutationOptions(),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.recent(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.lists(),
      });
      // Invalidate the specific insight detail to refresh stale data
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.detail(id),
      });
    },
  });

  const markRead = useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.recent(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights.lists(),
      });
    },
  });

  const handleDismiss = useCallback(
    async (id: string) => {
      setPendingDismissId(id);
      try {
        await dismiss.mutateAsync({ id });
      } finally {
        setPendingDismissId(null);
      }
    },
    [dismiss],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      setPendingRestoreId(id);
      try {
        await restore.mutateAsync({ id });
      } finally {
        setPendingRestoreId(null);
      }
    },
    [restore],
  );

  const handleMarkRead = useCallback(
    async (id: string) => {
      setPendingReadId(id);
      try {
        await markRead.mutateAsync({ id });
      } finally {
        setPendingReadId(null);
      }
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
      handleMarkRead(insight.id).catch(() => {
        // Error already handled by mutation error callback
      });
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
