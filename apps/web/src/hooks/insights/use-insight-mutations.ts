import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useInsightMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

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
  const handleDismiss = useCallback(
    (id: string) => dismiss.mutate({ id }),
    [dismiss],
  );
  const handleChat = useCallback(
    (id: string) => {
      // Navigate to chat page with insight context
      // The chat page will create the session on mount
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

  return {
    handleDismiss,
    handleOpen,
    handleChat,
    restore: restore.mutate,
    isDismissing: dismiss.isPending,
    isRestoring: restore.isPending,
    isMarkingRead: markRead.isPending,
  };
}
