import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useArchiveSession() {
  const trpc = useTRPC();
  const { invalidateChats, invalidateChatSession } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.coach.archiveSession.mutationOptions(),
    onSuccess: async (_, variables) => {
      await Promise.all([invalidateChatSession(), invalidateChats()]);
    },
  });
}
