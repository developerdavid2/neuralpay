import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useUnreadCountNotifications() {
  const trpc = useTRPC();

  return useQuery(
    trpc.notifications.appNotifications.unreadCount.queryOptions(),
  );
}
