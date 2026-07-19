"use client";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useRevokeSession() {
  const trpc = useTRPC();
  const { invalidateActiveSessions } = useInvalidateQueries();
  return useMutation(
    trpc.users.security.revokeSession.mutationOptions({
      onSuccess: async () => {
        await invalidateActiveSessions();
      },
    }),
  );
}
