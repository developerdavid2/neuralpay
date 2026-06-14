import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useArchiveSession } from "./mutations/use-archive-session";
import { useDeleteSession } from "./mutations/use-delete-session";
import { useStartSession } from "./mutations/use-start-session";
import type { Route } from "next";

// useChatSidebarActions — remove handleArchive, handleDelete, isArchiving, isDeleting
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
