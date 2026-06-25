import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateAccountsQueries } from "@/lib/invalidate-trpc-queries";
import { toast } from "sonner";

export function useDeleteAccount() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.accounts.delete.mutationOptions(),
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      await invalidateAccountsQueries(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      toast.error(message);
    },
  });
}
