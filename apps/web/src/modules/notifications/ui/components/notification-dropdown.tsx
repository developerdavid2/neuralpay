"use client";

import { formatGroupLabel, getDateGroup, groupByDate } from "@/lib/utils";
import type { AppNotification } from "@neuralpay/types";
import { cn } from "@neuralpay/ui/lib/utils";
import { ArrowRight, Bell, Check, Settings } from "lucide-react";
import Link from "next/link";
import { useMarkAllRead } from "../../hooks/mutations/use-mark-all-read-notifications";
import { useNotifications } from "../../hooks/queries/use-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 10,
    category: "all",
    status: "all",
  });
  const markAllRead = useMarkAllRead();

  const notifications =
    notificationsData?.pages?.flatMap((page) => page.items) ?? [];

  const grouped = groupByDate(notifications, (n: AppNotification) =>
    getDateGroup(new Date(n.createdAt)),
  );

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-full mt-2.5 w-[420px] z-50">
      {/* Glassmorphism container */}
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-white/70 dark:bg-[#1B1A22]/70",
          "backdrop-blur-[20px] backdrop-saturate-[180%]",
          "border border-white/30 dark:border-white/[0.08]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 dark:border-white/[0.06]">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            {hasUnread && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg",
                  "hover:bg-white/50 dark:hover:bg-white/10 transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <Link
              href="/dashboard/settings/notifications"
              onClick={onClose}
              className={cn(
                "p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors",
                "text-muted-foreground hover:text-foreground",
              )}
              title="Notification Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[440px] overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm text-muted-foreground mt-3">Loading...</p>
            </div>
          ) : !notifications.length ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
              <div className="p-4 rounded-full bg-white/40 dark:bg-white/5 mb-4">
                <Bell className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1 opacity-50">
                We will notify you when something happens
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-white/30 dark:bg-white/[0.03]">
                  {formatGroupLabel(group as any)}
                </div>
                {(items as AppNotification[]).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={onClose}
                    variant="compact"
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-white/20 dark:border-white/[0.06] px-5 py-3">
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-medium",
                "text-primary hover:underline transition-colors",
              )}
            >
              View All Notifications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
