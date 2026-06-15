import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useStartSession } from "./mutations/use-start-session";

export function useChatSidebarActions() {
  const router = useRouter();

  const startSession = useStartSession();

  const handleNewChat = useCallback(() => {
    router.push("/dashboard/ai-chat" as Route);
  }, [router]);

  const handleSelectSession = useCallback(
    (sessionId: string, contextType?: string, topic?: string) => {
      const params = new URLSearchParams();
      if (contextType && contextType !== "general")
        params.append("context", contextType);
      if (topic && topic !== "general") params.append("topic", topic);
      const queryString = params.toString();
      const url = `/dashboard/ai-chat/${sessionId}${queryString ? `?${queryString}` : ""}`;
      router.push(url as Route);
    },
    [router],
  );

  return {
    handleNewChat,
    handleSelectSession,
    isCreating: startSession.isPending,
  };
}
