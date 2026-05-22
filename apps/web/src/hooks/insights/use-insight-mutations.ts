// hooks/insights/use-insight-mutations.ts
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Insight } from "@/modules/insights/types";
import { invalidateInsightsQueries } from "@/lib/invalidate-trpc-queries";

export function useInsightMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);

  const dismiss = useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: () => invalidateInsightsQueries(queryClient),
  });

  const restore = useMutation({
    ...trpc.ai.insights.restore.mutationOptions(),
    onSuccess: () => invalidateInsightsQueries(queryClient),
  });

  const markRead = useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: () => invalidateInsightsQueries(queryClient),
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

  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardOpen = useCallback(
    (insight: Insight) => {
      setSelectedInsightId(insight.id);
      setDrawerOpen(true);
      handleMarkRead(insight.id).catch(() => {});
    },
    [handleMarkRead],
  );

  const isDismissing = useCallback(
    (id: string) => pendingDismissId === id,
    [pendingDismissId],
  );
  const isRestoring = useCallback(
    (id: string) => pendingRestoreId === id,
    [pendingRestoreId],
  );
  const isMarkingRead = useCallback(
    (id: string) => pendingReadId === id,
    [pendingReadId],
  );

  return {
    handleDismiss,
    handleRestore,
    handleMarkRead,
    selectedInsightId,
    drawerOpen,
    setDrawerOpen,
    handleCardOpen,
    isDismissing,
    isRestoring,
    isMarkingRead,
  };
}
