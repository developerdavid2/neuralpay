import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
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
  const { invalidateChats } = useInvalidateQueries();

  return useMutation<
    ChatSession,
    any,
    UpdateSessionTitleInput,
    MutationContext
  >({
    ...trpc.ai.coach.updateTitle.mutationOptions(),

    onMutate: async (variables) => {
      // Cancel coach-related queries
      await Promise.all([
        queryClient.cancelQueries(trpc.ai.coach.sessions.pathFilter()),

        queryClient.cancelQueries(trpc.ai.coach.sessionById.pathFilter()),
      ]);

      const sessionByIdKey = trpc.ai.coach.sessionById.queryOptions({
        sessionId: variables.sessionId,
        limit: 50,
      }).queryKey;

      // Snapshot current data
      const previousSession =
        queryClient.getQueryData<SessionByIdResponse>(sessionByIdKey);

      // Optimistically update current session
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

      // Optimistically update all session lists
      queryClient.setQueriesData<PaginatedChatSessions>(
        trpc.ai.coach.sessions.pathFilter(),
        (old) => {
          if (!old?.items) return old;

          return {
            ...old,
            items: old.items.map((session) =>
              session.id === variables.sessionId
                ? {
                    ...session,
                    title: variables.title,
                  }
                : session,
            ),
          };
        },
      );

      return {
        previousSession,
        sessionByIdKey,
      };
    },

    onSuccess: () => {
      toast.success("Title updated", {
        position: "top-center",
      });
    },

    onError: (_err, _variables, context) => {
      if (context?.previousSession && context.sessionByIdKey) {
        queryClient.setQueryData(
          context.sessionByIdKey,
          context.previousSession,
        );
      }

      toast.error("Failed to update title", {
        position: "top-center",
      });
    },

    onSettled: async () => {
      await Promise.all([
        invalidateChats(),
        queryClient.invalidateQueries(trpc.ai.coach.sessionById.pathFilter()),
      ]);
    },
  });
}
