import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function useRecentInsightNavigation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);

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
