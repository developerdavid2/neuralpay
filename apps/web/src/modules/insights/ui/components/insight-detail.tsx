"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { Button } from "@neuralpay/ui/components/button";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  MessageCircle,
  Archive,
  RotateCcw,
  X,
  Sparkles,
  ArrowLeft,
  Minus,
  Plus,
} from "lucide-react";
import {
  insightData,
  INSIGHTS_TYPE_LABELS,
  INSIGHTS_TYPE_STYLES,
} from "../../constants";
import type { Insight } from "../../types";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

interface InsightDetailsProps {
  insight: Insight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChat: (id: string) => void;
  onDismiss: (id: string) => void;
  onRestore?: (id: string) => void;
  isDismissing?: boolean;
  isRestoring?: boolean;
}

export function InsightDetails({
  insight,
  open,
  onOpenChange,
  onChat,
  onDismiss,
  onRestore,
  isDismissing,
  isRestoring,
}: InsightDetailsProps) {
  if (!insight) return null;

  const isDismissed = !!insight.dismissedAt;

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:max-w-[420px] data-[vaul-drawer-direction=left]:rounded-l-none data-[vaul-drawer-direction=left]:rounded-r-xl",
          "data-[vaul-drawer-direction=left]:border-l data-[vaul-drawer-direction=left]:border-r-0",
          "flex flex-col",
        )}
      >
        {/* Close button — absolute top-right */}
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
          >
            <X className="size-4" />
          </Button>
        </DrawerClose>

        <DrawerHeader className="space-y-4 pb-4">
          {/* Badge row */}
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
        </DrawerHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => {}}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">$2000</div>
                <div className="text-[0.70rem] text-muted-foreground uppercase">
                  Calories/day
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => {}}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <div className="mt-3 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insightData}>
                <Bar
                  dataKey="goal"
                  style={
                    {
                      fill: "var(--chart-2)",
                    } as React.CSSProperties
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            {insight.generatedAt && (
              <p>
                Generated: {new Date(insight.generatedAt).toLocaleDateString()}
              </p>
            )}
            {insight.readAt && (
              <p>Read: {new Date(insight.readAt).toLocaleDateString()}</p>
            )}
            {isDismissed && insight.dismissedAt && (
              <p>
                Dismissed: {new Date(insight.dismissedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t p-6 space-y-3">
          {!isDismissed ? (
            <>
              <Button
                className="w-full gap-2"
                onClick={() => onChat(insight.id)}
              >
                <MessageCircle className="size-4" />
                Chat about this
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 text-muted-foreground hover:text-destructive"
                onClick={() => onDismiss(insight.id)}
                disabled={isDismissing}
              >
                <Archive className="size-4" />
                {isDismissing ? "Dismissing..." : "Dismiss"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => onRestore?.(insight.id)}
              disabled={isRestoring}
            >
              <RotateCcw className="size-4" />
              {isRestoring ? "Restoring..." : "Restore Insight"}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
