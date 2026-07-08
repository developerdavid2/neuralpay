import { formatDateTimeSmart, formatRelative, formatTime } from "@/lib/utils";

import type { AppNotification } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { Card } from "@neuralpay/ui/components/card";
import { cn } from "@neuralpay/ui/lib/utils";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { categoryColors, categoryIcons, categoryLabels } from "../../constants";
import { useMarkReadNotification } from "../../hooks/mutations/use-mark-read-notification";
import { Input } from "@neuralpay/ui/components/input";
import { buildNotificationUrl } from "../../lib/notification-urls";

interface NotificationItemProps {
  notification: AppNotification;
  variant?: "compact" | "full";
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  variant = "compact",
  selectable = false,
  selected = false,
  onSelect,
  onClick,
}: NotificationItemProps) {
  const router = useRouter();
  const markRead = useMarkReadNotification();
  const isCompact = variant === "compact";
  const Icon = categoryIcons[notification.category];
  const colorClass = categoryColors[notification.category];
  const categoryLabel = categoryLabels[notification.category];

  const destinationUrl: Route = buildNotificationUrl(
    notification.type,
    notification.data as Record<string, unknown>,
  );

  const handleBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
    if (!notification.isRead) markRead.mutate({ id: notification.id });
    onClick?.();
    router.push(destinationUrl);
  };

  const createdAt = new Date(notification.createdAt);

  return (
    <div className="flex items-center gap-3 mx-6 py-1.5">
      {/* Checkbox — outside card */}
      {selectable && (
        <div
          data-checkbox
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(notification.id, e.target.checked)}
            className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
          />
        </div>
      )}

      {/* Card */}
      <Card
        onClick={handleBodyClick}
        className={cn(
          "group relative flex-1 flex flex-row items-start gap-3 cursor-pointer transition-colors duration-150",
          "border border-border/50 rounded-xl",
          isCompact ? "px-4 py-3" : "px-5 py-4",
          !notification.isRead
            ? "bg-gray-400/5 shadow-sm"
            : "bg-transparent shadow-none",
          selected && "ring-1 ring-primary/30 bg-primary/4",
          "hover:bg-accent dark:hover:bg-white/4",
        )}
      >
        {/* Unread dot */}
        {!notification.isRead && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
        )}

        {/* Icon */}
        <div
          className={cn(
            "shrink-0 flex items-center justify-center rounded-xl",
            isCompact ? "size-9" : "size-10",
            colorClass,
          )}
        >
          <Icon className={cn("shrink-0", isCompact ? "size-4" : "size-4.5")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <p
                className={cn(
                  "text-sm leading-snug line-clamp-1",
                  !notification.isRead
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {notification.title}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium",
                  colorClass,
                )}
              >
                {categoryLabel}
              </Badge>
            </div>
            <span
              className={cn(
                "shrink-0 tabular-nums whitespace-nowrap",
                isCompact ? "text-[11px]" : "text-xs",
                "text-muted-foreground",
              )}
              title={formatDateTimeSmart(createdAt)}
            >
              {isCompact ? formatRelative(createdAt) : formatTime(createdAt)}
            </span>
          </div>

          <p
            className={cn(
              "mt-0.5 line-clamp-2",
              isCompact ? "text-[13px]" : "text-sm",
              !notification.isRead
                ? "text-foreground/70"
                : "text-muted-foreground/70",
            )}
          >
            {notification.body}
          </p>

          {!isCompact && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground/60">
                {formatDateTimeSmart(createdAt)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
