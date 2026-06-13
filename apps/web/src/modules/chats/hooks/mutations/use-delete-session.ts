import { invalidateChatQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSession() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.deleteSession.mutationOptions(),
    onSuccess: () => invalidateChatQueries(queryClient),
  });
}
