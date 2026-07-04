import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useMarkUnreadNotification() {
  const trpc = useTRPC();
  const { invalidateNotifications } = useInvalidateQueries();

  return useMutation({
    ...trpc.notifications.appNotifications.markUnread.mutationOptions(),
    onSuccess: () => invalidateNotifications(),
  });
}
