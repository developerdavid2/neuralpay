import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useExchangePublicToken() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.exchangePublicToken.mutationOptions(),
    onSuccess: () => {
      toast.success("Bank connected successfully");
      queryClient.invalidateQueries({
        predicate: (query) => {
          const path = query.queryKey[0] as string[];
          if (!Array.isArray(path)) return false;
          return path[0] === "payments";
        },
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect bank",
      );
    },
  });
}
