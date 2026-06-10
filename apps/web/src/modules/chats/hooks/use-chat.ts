"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import type { ChatMessage } from "@neuralpay/types";
import { useSessionDetails } from "./queries/use-session-details";
import { useMessages } from "./queries/use-messages";
import { useStartSession } from "./mutations/use-start-session";
import { useSendMessage } from "./mutations/use-send-message";

interface OptimisticMessage extends ChatMessage {
  isOptimistic: true;
}

export function useChat(sessionId: string | undefined) {
  const router = useRouter();
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  // Always call hooks unconditionally — pass empty string when no sessionId
  const { session, isLoadingSession } = useSessionDetails(sessionId ?? "");
  const messagesQuery = useMessages(sessionId ?? "");

  const startSession = useStartSession();
  const sendMessageMutation = useSendMessage();

  const isLoading = isLoadingSession || messagesQuery.isLoading;
  const isSending = sendMessageMutation.isPending || startSession.isPending;

  // Only flatten pages when we have a real sessionId and data
  const serverMessages: ChatMessage[] =
    sessionId && messagesQuery.data
      ? messagesQuery.data.pages.flatMap((page) => page.items)
      : [];

  const messages = [...serverMessages, ...optimisticMessages];

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let targetSessionId = sessionId;

      if (!targetSessionId) {
        const session = await startSession.mutateAsync({
          contextType: "general",
          topic: "general",
          title: content.slice(0, 50),
        });
        targetSessionId = session.id;
        // router.push(`/ai-chat?session=${session.id}`);
      }

      const optimisticMsg: OptimisticMessage = {
        id: `optimistic-${Date.now()}`,
        sessionId: targetSessionId,
        userId: "",
        role: "user",
        content: content.trim(),
        tokensUsed: null,
        metadata: null,
        createdAt: new Date(),
        isOptimistic: true,
      };

      setOptimisticMessages((prev) => [...prev, optimisticMsg]);

      try {
        await sendMessageMutation.mutateAsync({
          sessionId: targetSessionId,
          content: content.trim(),
        });
        setOptimisticMessages([]);
      } catch (error) {
        setOptimisticMessages((prev) =>
          prev.filter((m) => m.id !== optimisticMsg.id),
        );
        throw error;
      }
    },
    [sessionId, startSession, sendMessageMutation, router],
  );

  return {
    session,
    messages,
    isLoading,
    isSending,
    sendMessage,
    messagesQuery,
  };
}
