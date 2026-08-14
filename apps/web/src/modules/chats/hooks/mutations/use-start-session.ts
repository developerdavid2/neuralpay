"use client";

import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";

export function useStartSession() {
  const trpc = useTRPC();
  const { invalidateChats } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: () => invalidateChats(),
  });
}
