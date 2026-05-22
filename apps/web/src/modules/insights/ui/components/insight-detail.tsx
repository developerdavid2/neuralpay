"use client";

import { useInsightDetail } from "@/hooks/insights/use-insights";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatTransactionDate } from "@/lib/utils";
import { Button } from "@neuralpay/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import { Archive, Loader2, MessageCircle, RotateCcw, X } from "lucide-react";
import { INSIGHTS_TYPE_LABELS, INSIGHTS_TYPE_STYLES } from "../../constants";
import type { Insight } from "../../types";

interface InsightDetailsProps {
  insightId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChat: (id: string) => void;
  onDismiss: (id: string) => Promise<void>; // async
  onRestore?: (id: string) => Promise<void>;
  isDismissing: (id: string) => boolean;
  isRestoring: (id: string) => boolean;
}

export function InsightDetails({
  insightId,
  open,
  onOpenChange,
  onChat,
  onDismiss,
  onRestore,
  isDismissing,
  isRestoring,
}: InsightDetailsProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");

  const { insight, isLoading } = useInsightDetail(insightId ?? "");

  if (!insightId) return null;

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[85vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-[420px]",
          "flex flex-col",
        )}
      >
        {isLoading ? (
          <InsightDetailsSkeleton onClose={() => onOpenChange(false)} />
        ) : !insight ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="text-sm text-muted-foreground">
              Insight not found or has been deleted
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <InsightDetailsContent
            insight={insight}
            onClose={() => onOpenChange(false)}
            onChat={onChat}
            onDismiss={onDismiss}
            onRestore={onRestore}
            isDismissing={isDismissing}
            isRestoring={isRestoring}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function InsightDetailsContent({
  insight,
  onClose,
  onChat,
  onDismiss,
  onRestore,
  isDismissing,
  isRestoring,
}: {
  insight: Insight;
  onClose: () => void;
  onChat: (id: string) => void;
  onDismiss: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  isDismissing: (id: string) => boolean;
  isRestoring: (id: string) => boolean;
}) {
  const isDismissed = !!insight.dismissedAt;
  const dismissing = isDismissing(insight.id);
  const restoring = isRestoring(insight.id);
  const isPending = dismissing || restoring;

  // Handle dismiss/restore with drawer close after completion
  const handleDismiss = async () => {
    await onDismiss(insight.id);
    onClose(); // close after success
  };

  const handleRestore = async () => {
    await onRestore?.(insight.id);
    onClose(); // close after success
  };

  return (
    <>
      <DrawerClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
          disabled={isPending}
        >
          <X className="size-4" />
        </Button>
      </DrawerClose>

      <DrawerHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
              INSIGHTS_TYPE_STYLES[
                insight.type as keyof typeof INSIGHTS_TYPE_STYLES
              ] ?? "bg-muted text-muted-foreground",
            )}
          >
            {INSIGHTS_TYPE_LABELS[
              insight.type as keyof typeof INSIGHTS_TYPE_LABELS
            ] ?? insight.type}
          </span>
          {insight.severity && (
            <span className="text-xs text-muted-foreground capitalize">
              {insight.severity}
            </span>
          )}
        </div>

        <DrawerTitle className="text-lg font-semibold leading-tight">
          {insight.title}
        </DrawerTitle>

        <DrawerDescription className="text-sm leading-relaxed text-muted-foreground">
          {insight.description}
        </DrawerDescription>

        <p className="text-xs text-muted-foreground/70">
          Generated: {formatTransactionDate(insight.generatedAt)}
        </p>
      </DrawerHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* ... existing content ... */}
      </div>

      {/* Footer actions */}
      <div className="border-t p-6 space-y-3">
        {!isDismissed ? (
          <>
            <Button
              className="w-full gap-2"
              onClick={() => onChat(insight.id)}
              disabled={isPending}
            >
              <MessageCircle className="size-4" />
              Chat about this
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-muted-foreground hover:text-destructive"
              onClick={handleDismiss}
              disabled={dismissing}
            >
              {dismissing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Archive className="size-4" />
              )}
              {dismissing ? "Dismissing..." : "Dismiss"}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleRestore}
            disabled={restoring}
          >
            {restoring ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            {restoring ? "Restoring..." : "Restore Insight"}
          </Button>
        )}
      </div>
    </>
  );
}

function InsightDetailsSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DrawerClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </DrawerClose>

      <DrawerHeader className="space-y-4 pb-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-24 rounded-lg" />
          <Skeleton className="h-14 w-24 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      <div className="border-t p-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </>
  );
}
