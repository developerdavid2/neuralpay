import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { invalidateInsightsQueries } from "@/lib/invalidate-trpc-queries";

export function useRecentInsightNavigation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);

  const dismiss = useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: () => {
      invalidateInsightsQueries(queryClient);
    },
  });

  const markRead = useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: () => {
      invalidateInsightsQueries(queryClient);
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

  const handleChat = useCallback(
    (id: string) => {
      router.push(`/dashboard/ai-chat?contextType=insight&contextId=${id}`);
    },
    [router],
  );

  const handleOpen = useCallback(
    (id: string) => {
      markRead.mutate({ id });
      router.push(`/dashboard/ai-insights?focus=${id}`);
    },
    [markRead, router],
  );

  const isDismissing = useCallback(
    (id: string) => pendingDismissId === id,
    [pendingDismissId],
  );

  return {
    handleDismiss,
    handleOpen,
    handleChat,
    isDismissing,
    isMarkingRead: markRead.isPending,
  };
}
