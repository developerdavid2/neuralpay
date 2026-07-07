import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@neuralpay/types";

export function useMarkAllRead() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutationFn } =
    trpc.notifications.appNotifications.markAllRead.mutationOptions();

  const notificationsFilter = trpc.notifications.appNotifications.pathFilter();

  return useMutation({
    mutationFn,
    onMutate: async () => {
      const snapshot = queryClient.getQueriesData(notificationsFilter);

      queryClient.setQueriesData(
        trpc.notifications.appNotifications.list.pathFilter(),
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((n: AppNotification) => ({
                ...n,
                isRead: true,
                readAt: new Date(),
              })),
            })),
          };
        },
      );

      queryClient.setQueryData(
        trpc.notifications.appNotifications.unreadCount.queryKey(),
        0,
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
