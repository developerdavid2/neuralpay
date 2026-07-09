"use client";

import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useStartSession() {
  const trpc = useTRPC();
  const { invalidateChats } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: () => invalidateChats(),
  });
}
