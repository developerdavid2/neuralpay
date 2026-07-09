import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useUnarchiveSession() {
  const trpc = useTRPC();
  const { invalidateChats, invalidateChatSession } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.coach.unarchiveSession.mutationOptions(),
    onSuccess: async () => {
      await Promise.all([invalidateChatSession(), invalidateChats()]);
    },
  });
}
