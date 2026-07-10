"use client";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeOthers() {
  const trpc = useTRPC();
  const { invalidateActiveSessions } = useInvalidateQueries();
  return useMutation(
    trpc.users.security.revokeOtherSessions.mutationOptions({
      onSuccess: async () => {
        await invalidateActiveSessions();
      },
    }),
  );
}
