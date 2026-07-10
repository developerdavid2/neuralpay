import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function useRecentInsightNavigation() {
  const trpc = useTRPC();
  const { invalidateInsights } = useInvalidateQueries();
  const router = useRouter();

  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);

  const dismiss = useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: () => {
      invalidateInsights();
    },
  });

  const markRead = useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: () => {
      invalidateInsights();
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
      router.push(
        `/dashboard/ai-chat?contextType=insight&contextId=${id}` as never,
      );
    },
    [router],
  );

  const handleOpen = useCallback(
    (id: string) => {
      markRead.mutate({ id });
      router.push(`/dashboard/ai-insights?focus=${id}` as never);
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
