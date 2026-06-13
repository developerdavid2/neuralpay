import { invalidateChatQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useArchiveSession() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.archiveSession.mutationOptions(),
    onSuccess: () => invalidateChatQueries(queryClient),
  });
}
