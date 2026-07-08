import { useTRPC } from "@/trpc/trpc-client";
import type { NotificationsFilterInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useNotifications(input: NotificationsFilterInput) {
  const trpc = useTRPC();
  return useSuspenseInfiniteQuery(
    trpc.notifications.appNotifications.list.infiniteQueryOptions(input, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    }),
  );
}
