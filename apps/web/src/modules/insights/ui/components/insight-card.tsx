"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";
import { cn } from "@neuralpay/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  X,
  MessageCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useCallback } from "react";
import type { Insight } from "../../types";
import { INSIGHTS_TYPE_LABELS, INSIGHTS_TYPE_STYLES } from "../../constants";

interface InsightCardProps {
  insight: Insight;
  onDismiss: (id: string) => void;
  onChat: (id: string) => void;
  onOpen: (id: string) => void;
  isDismissing: boolean;
}

export const InsightCard = ({
  insight,
  onDismiss,
  onChat,
  onOpen,
  isDismissing,
}: InsightCardProps) => {
  const isUnread = !insight.readAt;
  const isArchived = !!insight.dismissedAt;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 px-5 py-4 transition-colors",
        "hover:bg-accent/50 cursor-pointer",
        isUnread && "bg-accent/30",
        isArchived && "opacity-60",
      )}
      onClick={() => onOpen(insight.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onOpen(insight.id);
        }
      }}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
      )}

      {/* Header row: badge + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              INSIGHTS_TYPE_STYLES[
                insight.type as keyof typeof INSIGHTS_TYPE_STYLES
              ] ?? "bg-muted text-muted-foreground",
            )}
          >
            {INSIGHTS_TYPE_LABELS[
              insight.type as keyof typeof INSIGHTS_TYPE_LABELS
            ] ?? insight.type}
          </span>
          {isUnread && (
            <span className="flex h-2 w-2 rounded-full bg-primary">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChat(insight.id);
            }}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Chat about this insight"
            title="Chat about this"
          >
            <MessageCircle className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(insight.id);
            }}
            disabled={isDismissing}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
            aria-label="Archive insight"
            title="Archive"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-sm text-foreground",
          isUnread ? "font-semibold" : "font-medium",
        )}
      >
        {insight.title}
      </p>

      {/* Description */}
      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {insight.description}
      </p>

      {/* Action row: Chat CTA */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat(insight.id);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Sparkles className="size-3" />
          Chat about this
          <ChevronRight className="size-3" />
        </button>
      </div>
    </div>
  );
};

/**
 * Empty state when no insights available
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        No insights yet
      </p>
      <p className="text-xs text-muted-foreground max-w-50">
        Insights are generated automatically as you spend. Connect your bank
        account to get started.
      </p>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2 px-5 py-4 animate-pulse">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-20 rounded-full bg-muted" />
            <div className="h-4 w-4 rounded bg-muted" />
          </div>
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
