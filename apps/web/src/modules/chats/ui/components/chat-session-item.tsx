"use client";

import { formatDate } from "@/lib/utils";
import type {
  ChatContextType,
  ChatSession,
  ChatTopicType,
} from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  Archive,
  Loader2,
  MoreVertical,
  PiggyBank,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

const topicIcons: Record<ChatTopicType, React.ReactNode> = {
  budgeting: <Wallet className="size-3" />,
  spending: <TrendingUp className="size-3" />,
  savings: <PiggyBank className="size-3" />,
  general: <Sparkles className="size-3" />,
};

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isArchiving: boolean;
  isDeleting: boolean;
  onSelect: (sessionId: string) => void;
  onArchive: (sessionId: string, title: string) => void;
  onDelete: (sessionId: string, title: string) => void;
}

export function ChatSessionItem({
  session,
  isActive,
  isArchiving,
  isDeleting,
  onSelect,
  onArchive,
  onDelete,
}: ChatSessionItemProps) {
  // Track if this specific row is being archived or deleted
  const [isThisRowDeleting, setIsThisRowDeleting] = useState(false);
  const [isThisRowArchiving, setIsThisRowArchiving] = useState(false);

  const isProcessing = isThisRowDeleting || isThisRowArchiving;

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsThisRowArchiving(true);
    onArchive(session.id, session.title);
    // Reset after a short delay to allow optimistic updates
    setTimeout(() => setIsThisRowArchiving(false), 500);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsThisRowDeleting(true);
    onDelete(session.id, session.title);
    // Reset after a short delay to allow optimistic updates
    setTimeout(() => setIsThisRowDeleting(false), 500);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 cursor-pointer transition-all duration-200",
        isActive
          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium shadow-sm"
          : "hover:bg-muted/60 text-foreground",
        isProcessing && "opacity-50 pointer-events-none",
      )}
      onClick={() => onSelect(session.id)}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{session.title}</p>
        <p
          className={cn(
            "truncate text-[10px]",
            isActive
              ? "text-violet-600/70 dark:text-violet-300/70"
              : "text-muted-foreground",
          )}
        >
          {session.contextType !== "general" && (
            <span className="capitalize">{session.contextType} &bull; </span>
          )}
          {formatDate(session.updatedAt)}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {isProcessing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <MoreVertical className="size-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={handleArchiveClick} disabled={isArchiving}>
            <Archive className="mr-2 size-3.5" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ChatSessionItemSkeleton() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
      {/* Topic icon */}
      <Skeleton className="size-3 rounded shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>

      {/* Action button placeholder */}
      <Skeleton className="size-6 rounded" />
    </div>
  );
}
