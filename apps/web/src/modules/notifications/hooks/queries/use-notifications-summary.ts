import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import type { NotificationsSummaryInput } from "@neuralpay/types";

export function useNotificationsSummary(input: NotificationsSummaryInput) {
  const trpc = useTRPC();
  return useQuery(
    trpc.notifications.appNotifications.summary.queryOptions(input),
  );
}
