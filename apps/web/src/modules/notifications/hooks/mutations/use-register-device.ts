import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useRegisterDevice() {
  const trpc = useTRPC();
  return useMutation(
    trpc.notifications.appNotifications.registerDevice.mutationOptions(),
  );
}
