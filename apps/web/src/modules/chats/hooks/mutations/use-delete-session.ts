import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

export function useDeleteSession() {
  const trpc = useTRPC();
  const { invalidateChats, invalidateChatSession } = useInvalidateQueries();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    ...trpc.ai.coach.deleteSession.mutationOptions(),
    onSuccess: async (_, variables) => {
      const sessionRoute = `/dashboard/ai-chat/${variables.sessionId}`;
      const deletingActiveSession = pathname?.startsWith(sessionRoute);
      if (deletingActiveSession) {
        router.push("/dashboard/ai-chat" as Route);
      }
      await Promise.all([
        invalidateChatSession(),
        deletingActiveSession ? Promise.resolve() : invalidateChatSession(),
      ]);
    },
  });
}
