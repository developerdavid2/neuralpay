"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarkReadNotification } from "../../hooks/mutations/use-mark-read-notification";
import { cn } from "@neuralpay/ui/lib/utils";
import type { AppNotification } from "@neuralpay/types";
import type { Route } from "next";
import { categoryColors, categoryIcons, categoryLabels } from "../../constants";
import { formatRelative, formatDateTimeSmart, formatTime } from "@/lib/utils";
import { Badge } from "@neuralpay/ui/components/badge";

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
  const [isHovered, setIsHovered] = useState(false);
  const markRead = useMarkReadNotification();

  const isCompact = variant === "compact";
  const Icon = categoryIcons[notification.category];
  const colorClass = categoryColors[notification.category];
  const categoryLabel = categoryLabels[notification.category];

  const handleBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-checkbox]")) return;

    if (!notification.isRead) {
      markRead.mutate({ id: notification.id });
    }
    onClick?.();
    router.push(notification.data.actionUrl as Route);
  };

  const createdAt = new Date(notification.createdAt);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-start gap-3 transition-all duration-200 cursor-pointer",
        "hover:bg-white/40 dark:hover:bg-white/[0.03]",
        !notification.isRead
          ? "bg-white/60 dark:bg-white/[0.04]"
          : "bg-transparent",
        isCompact
          ? "px-5 py-3 border-b border-white/10 dark:border-white/5 last:border-0"
          : "px-5 py-4 border-b border-white/10 dark:border-white/5 last:border-0",
      )}
    >
      {/* Checkbox (Gmail-style hover reveal) */}
      {selectable && (
        <div
          data-checkbox
          className={cn(
            "pt-1 transition-opacity duration-150 shrink-0",
            !isHovered && !selected && "opacity-0 group-hover:opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(notification.id, e.target.checked)}
            className="rounded border-input h-4 w-4 accent-primary"
          />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center rounded-xl",
          isCompact ? "w-9 h-9" : "w-10 h-10",
          colorClass,
        )}
      >
        <Icon
          className={cn(
            "shrink-0",
            isCompact ? "h-4 w-4" : "h-[18px] w-[18px]",
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={handleBodyClick}>
        {/* Header row: Title + Time */}
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

            {/* Category tag — only in full variant */}
            {!isCompact && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium",
                  "bg-white/50 dark:bg-white/10",
                )}
              >
                {categoryLabel}
              </Badge>
            )}
          </div>

          {/* Time */}
          <span
            className={cn(
              "flex-shrink-0 tabular-nums whitespace-nowrap",
              isCompact
                ? "text-[11px] text-muted-foreground"
                : "text-xs text-muted-foreground",
            )}
            title={formatDateTimeSmart(createdAt)}
          >
            {isCompact ? formatRelative(createdAt) : formatTime(createdAt)}
          </span>
        </div>

        {/* Body */}
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

        {/* Footer row — only in full variant */}
        {!isCompact && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-muted-foreground/60">
              {formatDateTimeSmart(createdAt)}
            </span>

            {/* Related type tag if available */}
            {notification.data?.relatedType && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-white/20"
              >
                {notification.data.relatedType}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-primary shadow-[0_0_6px_rgba(124,58,237,0.5)]" />
      )}
    </div>
  );
}
