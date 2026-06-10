import {
  invalidateChatQueries,
  invalidateChatSessionQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTitle() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.updateTitle.mutationOptions(),
    onSuccess: (data) =>
      Promise.all([
        invalidateChatQueries(queryClient),
        invalidateChatSessionQueries(queryClient, data.id),
      ]),
  });
}
