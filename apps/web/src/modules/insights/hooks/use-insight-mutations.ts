import { invalidateInsightsQueries } from "@/lib/invalidate-trpc-queries";
import type { Insight } from "@/modules/insights/types";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function useInsightMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mutations
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

  const syncFocusToUrl = useCallback((insightId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("focus", insightId);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  const removeFocusFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  // Action handlers
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

  // Drawer + URL management
  const handleCardOpen = useCallback(
    (insight: Insight) => {
      setSelectedInsightId(insight.id);
      setDrawerOpen(true);
      syncFocusToUrl(insight.id);
      handleMarkRead(insight.id).catch((error) => {
        console.error("[useInsightMutations] markRead failed", error);
      });
    },
    [syncFocusToUrl, handleMarkRead],
  );

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    removeFocusFromUrl();
  }, [removeFocusFromUrl]);

  // Pending state checkers
  const isDismissing = useCallback(
    (id: string) => pendingDismissId === id,
    [pendingDismissId],
  );

  const isRestoring = useCallback(
    (id: string) => pendingRestoreId === id,
    [pendingRestoreId],
  );

  return {
    // Mutations
    handleDismiss,
    handleRestore,
    handleMarkRead,
    // Drawer management
    handleCardOpen,
    handleDrawerClose,
    selectedInsightId,
    drawerOpen,
    setDrawerOpen,
    // Pending state
    isDismissing,
    isRestoring,
  };
}
