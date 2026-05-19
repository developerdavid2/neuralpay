import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useRecentInsightNavigation() {
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
      router.push(`/dashboard/ai-chat?contextType=insight&contextId=${id}`);
    },
    [router],
  );

  // Dashboard: navigate to full page with focus, mark as read
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
    isDismissing: dismiss.isPending,
    isMarkingRead: markRead.isPending,
  };
}
