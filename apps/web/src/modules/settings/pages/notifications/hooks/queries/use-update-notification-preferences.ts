import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateNotificationPreferences(mutationKey?: string[]) {
  const trpc = useTRPC();
  const { invalidateNotifications, invalidateNotificationPreferences } =
    useInvalidateQueries();

  return useMutation({
    ...trpc.notifications.appNotifications.updatePreferences.mutationOptions(),
    mutationKey: mutationKey ?? ["updateNotificationPreferences"],
    onSuccess: () => {
      invalidateNotifications();
      invalidateNotificationPreferences();
    },
    onError: () => {
      toast.error("Failed to update preference");
    },
  });
}
