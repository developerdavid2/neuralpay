"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { ChatContextType, ChatTopicType } from "@neuralpay/types";
import { invalidateChatQueries } from "@/lib/invalidate-trpc-queries";

export function useContextualChat() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: () => invalidateChatQueries(queryClient),
  });

  const startChat = useCallback(
    async (
      contextType: ChatContextType,
      contextId: string,
      title?: string,
      topic?: ChatTopicType,
    ) => {
      const session = await mutation.mutateAsync({
        contextType,
        contextId,
        title: title ?? `Chat about ${contextType}`,
        topic: topic ?? "general",
      });

      // Navigate to chat page with the new session
      // router.push(`/ai-chat?session=${session.id}`);

      return session;
    },
    [mutation, router],
  );

  return {
    startChat,
    isPending: mutation.isPending,
  };
}
