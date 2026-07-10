import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useUpdateAccount() {
  const trpc = useTRPC();
  const { invalidateAccounts } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.accounts.update.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccounts();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to update account";
      console.error(message);
    },
  });
}
