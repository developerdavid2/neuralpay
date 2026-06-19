import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDisconnectBank() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.disconnectBank.mutationOptions(),
    onSuccess: () => {
      toast.success("Bank disconnected successfully");
      queryClient.invalidateQueries({
        predicate: (query) => {
          const path = query.queryKey[0] as string[];
          if (!Array.isArray(path)) return false;
          return (
            path[0] === "payments" &&
            (path[1] === "plaid" ||
              path[1] === "accounts" ||
              path[1] === "transactions")
          );
        },
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect bank",
      );
    },
  });
}
