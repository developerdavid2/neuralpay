"use client";

import { invalidateChatQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartSession() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: () => invalidateChatQueries(queryClient),
  });
}
