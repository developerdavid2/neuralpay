import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@neuralpay/types";

export function useMarkManyReadNotifications() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutationFn } =
    trpc.notifications.appNotifications.markManyRead.mutationOptions();

  const notificationsFilter = trpc.notifications.appNotifications.pathFilter();

  return useMutation({
    mutationFn,
    onMutate: async ({ ids }) => {
      const snapshot = queryClient.getQueriesData(notificationsFilter);
      const idSet = new Set(ids);

      queryClient.setQueriesData(
        trpc.notifications.appNotifications.list.pathFilter(),
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((n: AppNotification) =>
                idSet.has(n.id)
                  ? { ...n, isRead: true, readAt: new Date() }
                  : n,
              ),
            })),
          };
        },
      );

      // Count how many were actually unread before marking
      const unreadCount = queryClient
        .getQueriesData<any>(
          trpc.notifications.appNotifications.list.pathFilter(),
        )
        .flatMap(([, data]) => data?.pages?.flatMap((p: any) => p.items) ?? [])
        .filter((n: AppNotification) => idSet.has(n.id) && !n.isRead).length;

      queryClient.setQueryData(
        trpc.notifications.appNotifications.unreadCount.queryKey(),
        (old: number = 0) => Math.max(0, old - unreadCount),
      );

      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(notificationsFilter);
    },
  });
}
