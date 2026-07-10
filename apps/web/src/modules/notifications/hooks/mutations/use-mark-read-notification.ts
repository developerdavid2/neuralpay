import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@neuralpay/types";

export function useMarkReadNotification() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutationFn } =
    trpc.notifications.appNotifications.markRead.mutationOptions();

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
                n.id === id ? { ...n, isRead: true, readAt: new Date() } : n,
              ),
            })),
          };
        },
      );

      queryClient.setQueryData(
        trpc.notifications.appNotifications.unreadCount.queryKey(),
        (old: number = 0) => Math.max(0, old - 1),
      );

      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    // In all 5 optimistic mutation hooks, replace onSettled with:
    onSettled: () => {
      // Don't refetch the entire list — cache is already updated optimistically
      // Only reconcile the counts which we can't easily predict server-side
      queryClient.invalidateQueries({
        ...trpc.notifications.appNotifications.unreadCount.pathFilter(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        ...trpc.notifications.appNotifications.summary.pathFilter(),
        refetchType: "active",
      });
      // Invalidate list but don't immediately refetch all pages
      queryClient.invalidateQueries({
        ...trpc.notifications.appNotifications.list.pathFilter(),
        refetchType: "none", // mark stale but don't trigger cascade refetch
      });
    },
  });
}
