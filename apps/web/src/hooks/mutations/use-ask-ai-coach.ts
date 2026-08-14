"use client";

import type { ChatContextType } from "@neuralpay/types";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useStartSession } from "@/modules/chats/hooks/mutations/use-start-session";

export function useAskAICoach() {
  const router = useRouter();
  const startSession = useStartSession();

  const askAboutContext = useCallback(
    async (contextType: ChatContextType, contextId: string, prompt: string) => {
      const session = await startSession.mutateAsync({
        contextType,
        contextId,
        topic:
          contextType === "budget"
            ? "budgeting"
            : contextType === "transaction"
              ? "spending"
              : "general",
        title: prompt.slice(0, 50),
      });

      router.push(
        `/dashboard/ai-chat/${session.id}?initialMessage=${encodeURIComponent(prompt)}` as Route,
      );
    },
    [router, startSession],
  );

  return { askAboutContext, isPending: startSession.isPending };
}
