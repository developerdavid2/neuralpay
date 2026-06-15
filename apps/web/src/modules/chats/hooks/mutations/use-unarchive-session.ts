import {
  invalidateChatQueries,
  invalidateChatSessionQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnarchiveSession() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.unarchiveSession.mutationOptions(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateChatSessionQueries(queryClient, variables.sessionId),
        invalidateChatQueries(queryClient),
      ]);
    },
  });
}
