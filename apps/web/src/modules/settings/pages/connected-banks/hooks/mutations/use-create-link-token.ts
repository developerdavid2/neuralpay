import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateLinkToken() {
  const trpc = useTRPC();

  return useMutation({
    ...trpc.payments.plaid.createLinkToken.mutationOptions(),
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initialize bank connection",
      );
    },
  });
}
