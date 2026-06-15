import {
  invalidateChatQueries,
  invalidateChatSessionQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

export function useDeleteSession() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    ...trpc.ai.coach.deleteSession.mutationOptions(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateChatSessionQueries(queryClient, variables.sessionId),
        invalidateChatQueries(queryClient),
      ]);

      const sessionRoute = `/dashboard/ai-chat/${variables.sessionId}`;
      if (pathname?.startsWith(sessionRoute)) {
        router.push("/dashboard/ai-chat" as Route);
      }
    },
  });
}
