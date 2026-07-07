import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@neuralpay/types";

export function useMarkUnreadNotification() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutationFn } =
    trpc.notifications.appNotifications.markUnread.mutationOptions();

  const notificationsFilter = trpc.notifications.appNotifications.pathFilter();

  return useMutation({
    mutationFn,
    onMutate: async ({ id }) => {
      const snapshot = queryClient.getQueriesData(notificationsFilter);

      queryClient.setQueriesData(
        trpc.notifications.appNotifications.list.pathFilter(),
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((n: AppNotification) =>
                n.id === id ? { ...n, isRead: false, readAt: null } : n,
              ),
            })),
          };
        },
      );

      queryClient.setQueryData(
        trpc.notifications.appNotifications.unreadCount.queryKey(),
        (old: number = 0) => old + 1,
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
