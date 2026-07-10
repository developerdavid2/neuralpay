import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useVerify2FA() {
  const trpc = useTRPC();
  const { invalidateTwoFactorStatus } = useInvalidateQueries();

  return useMutation(
    trpc.users.security.verify2FA.mutationOptions({
      onSuccess: async () => await invalidateTwoFactorStatus(),
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to verify two factor";
        console.error(message);
      },
    }),
  );
}
