import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEnable2FA() {
  const trpc = useTRPC();
  return useMutation({
    ...trpc.users.security.enable2FA.mutationOptions(),
    onSuccess: async () => {
      toast.success("Two factor auth enabled");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to enable two factor";
      console.error(message);
    },
  });
}
