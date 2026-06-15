import {
  invalidateChatQueries,
  invalidateChatSessionQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import type {
  ChatSession,
  PaginatedChatMessages,
  PaginatedChatSessions,
  UpdateSessionTitleInput,
} from "@neuralpay/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SessionByIdResponse {
  session: ChatSession;
  messages: PaginatedChatMessages;
}

interface MutationContext {
  previousSession: SessionByIdResponse | undefined;
  sessionByIdKey: unknown[];
}

export function useUpdateTitle() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation<
    ChatSession,
    any,
    UpdateSessionTitleInput,
    MutationContext
  >({
    ...trpc.ai.coach.updateTitle.mutationOptions(),
    onMutate: async (variables: UpdateSessionTitleInput) => {
      await queryClient.cancelQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[];
          const path = key[0] as unknown[];
          return (
            Array.isArray(path) &&
            path[0] === "ai" &&
            path[1] === "coach" &&
            (path[2] === "sessionById" || path[2] === "sessions")
          );
        },
      });

      const sessionByIdKey = trpc.ai.coach.sessionById.queryOptions({
        sessionId: variables.sessionId,
        limit: 50,
      }).queryKey;

      // Snapshot previous data
      const previousSession =
        queryClient.getQueryData<SessionByIdResponse>(sessionByIdKey);

      // Optimistically patch sessionById
      queryClient.setQueryData<SessionByIdResponse>(sessionByIdKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          session: {
            ...old.session,
            title: variables.title,
          },
        };
      });

      // Also patch all sessions list queries
      queryClient.setQueriesData<PaginatedChatSessions>(
        {
          predicate: (query) => {
            const key = query.queryKey as unknown[];
            const path = key[0] as unknown[];
            return (
              Array.isArray(path) &&
              path[0] === "ai" &&
              path[1] === "coach" &&
              path[2] === "sessions"
            );
          },
        },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((session) =>
              session.id === variables.sessionId
                ? { ...session, title: variables.title }
                : session,
            ),
          };
        },
      );

      toast.success("Title updated", { position: "top-center" });

      return { previousSession, sessionByIdKey } as MutationContext;
    },
    onError: (err, variables, context) => {
      const typedContext = context as MutationContext | undefined;
      if (typedContext?.previousSession && typedContext?.sessionByIdKey) {
        queryClient.setQueryData<SessionByIdResponse>(
          typedContext.sessionByIdKey,
          typedContext.previousSession,
        );
      }
      toast.error("Failed to update title", { position: "top-center" });
    },
    onSettled: async (_, __, variables) => {
      await Promise.all([
        invalidateChatQueries(queryClient),
        invalidateChatSessionQueries(queryClient, variables.sessionId),
      ]);
    },
  });
}
