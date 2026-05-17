import { useState, useCallback } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";
import { useRouter } from "next/navigation";

export function useChat(initialSessionId?: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get or create session
  const { data: chatSession, isLoading } = useSuspenseQuery(
    trpc.ai.coach.sessionById.queryOptions(
      { sessionId: initialSessionId ?? "" },
      { enabled: !!initialSessionId },
    ),
  );

  const startChatMutation = useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: (data) => {
      router.push(`/dashboard/ai-chat?sessionId=${data.id}`);
    },
  });

  const chatAbout = useCallback(
    (insightId: string) => {
      startChatMutation.mutate({
        contextType: "insight",
        contextId: insightId,
        title: "Chat about insight",
        topic: "general",
      });
    },
    [startChatMutation],
  );

  // Combine server messages with optimistic ones
  const messages = chatSession.messages ?? [];

  return {
    session: chatSession.session,
    // messages: allMessages,
    isLoading: isLoading,
    // isSending: sendMessageMutation.isPending || startSessionMutation.isPending,
    // sendMessage,
    // startSession: startSessionMutation.mutate,
  };
}
