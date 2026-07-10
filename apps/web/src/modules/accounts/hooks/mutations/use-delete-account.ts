import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useDeleteAccount() {
  const trpc = useTRPC();
  const { invalidateAccounts } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.accounts.delete.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccounts();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      console.error(message);
    },
  });
}
