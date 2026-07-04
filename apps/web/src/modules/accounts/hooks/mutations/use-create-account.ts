import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useCreateAccount() {
  const trpc = useTRPC();
  const { invalidateAccounts } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.accounts.create.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccounts();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      console.error(message);
    },
  });
}
