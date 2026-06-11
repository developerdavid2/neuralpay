import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useChatStore } from "../store/use-chat-store";
import { useArchiveSession } from "./mutations/use-archive-session";
import { useDeleteSession } from "./mutations/use-delete-session";
import { useStartSession } from "./mutations/use-start-session";
import type { Route } from "next";

/**
 * Consolidates all sidebar session actions:
 * - New chat creation (routes to /ai-chat without sessionId)
 * - Session selection with proper params (contextType, topic)
 * - Archive with confirmation
 * - Delete with confirmation and error recovery
 */
export function useChatSidebarActions() {
  const router = useRouter();
  const { activeSessionId, setActiveSessionId } = useChatStore();
  const [ConfirmDialog, confirm] = useConfirm();

  const startSession = useStartSession();
  const archiveSession = useArchiveSession();
  const deleteSession = useDeleteSession();

  const handleNewChat = useCallback(async () => {
    // Route to /ai-chat without sessionId
    // Session will be created on first message submission
    setActiveSessionId(null);
    router.push("/dashboard/ai-chat" as Route);
  }, [router, setActiveSessionId]);

  const handleSelectSession = useCallback(
    (sessionId: string, contextType?: string, topic?: string) => {
      setActiveSessionId(sessionId);

      // Build URL with optional query params
      const params = new URLSearchParams();
      if (contextType && contextType !== "general") {
        params.append("context", contextType);
      }
      if (topic && topic !== "general") {
        params.append("topic", topic);
      }

      const queryString = params.toString();
      const url = `/dashboard/ai-chat/${sessionId}${
        queryString ? `?${queryString}` : ""
      }`;
      router.push(url as Route);
    },
    [router, setActiveSessionId],
  );

  const handleArchive = useCallback(
    async (sessionId: string, sessionTitle: string) => {
      const confirmed = await confirm({
        title: "Archive conversation",
        message: `Are you sure you want to archive "${sessionTitle}"? You can restore it from archived conversations.`,
        variant: "default",
        confirmLabel: "Archive",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        archiveSession.mutate(
          { sessionId },
          {
            onSuccess: () => {
              toast.success("Conversation archived");
            },
            onError: (error) => {
              const message =
                error instanceof Error ? error.message : "Failed to archive";
              toast.error(message);
            },
          },
        );
      }
    },
    [archiveSession, confirm],
  );

  const handleDelete = useCallback(
    async (sessionId: string, sessionTitle: string) => {
      const confirmed = await confirm({
        title: "Delete conversation",
        message: `Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`,
        variant: "destructive",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        deleteSession.mutate(
          { sessionId },
          {
            onSuccess: () => {
              toast.success("Conversation deleted");
              // If the deleted session was active, navigate away
              if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                router.push("/dashboard/ai-chat" as Route);
              }
            },
            onError: (error) => {
              const message =
                error instanceof Error ? error.message : "Failed to delete";
              toast.error(message);
            },
          },
        );
      }
    },
    [deleteSession, activeSessionId, setActiveSessionId, router, confirm],
  );

  return {
    ConfirmDialog,
    handleNewChat,
    handleSelectSession,
    handleArchive,
    handleDelete,
    isArchiving: archiveSession.isPending,
    isDeleting: deleteSession.isPending,
    isCreating: startSession.isPending,
  };
}
