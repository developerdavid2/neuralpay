import {
  invalidateChatQueries,
  invalidateChatSessionQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.sendMessage.mutationOptions(),
    onSuccess: (data) => {
      const sessionId = data.userMessage.sessionId;
      return Promise.all([
        invalidateChatQueries(queryClient),
        invalidateChatSessionQueries(queryClient, sessionId),
      ]);
    },
  });
}
