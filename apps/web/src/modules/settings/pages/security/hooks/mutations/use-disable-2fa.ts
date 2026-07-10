import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDisable2FA() {
  const trpc = useTRPC();
  const { invalidateTwoFactorStatus } = useInvalidateQueries();
  return useMutation(
    trpc.users.security.disable2FA.mutationOptions({
      onSuccess: async () => {
        await invalidateTwoFactorStatus();
      },
    }),
  );
}
