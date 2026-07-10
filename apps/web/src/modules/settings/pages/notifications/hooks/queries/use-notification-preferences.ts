import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useNotificationPreferences() {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.notifications.appNotifications.getPreferences.queryOptions(),
  );
}
