"use client";

import { Button } from "@neuralpay/ui/components/button";
import { Loader2, Plus, MessageSquare } from "lucide-react";

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  isCreating: boolean;
}

export function ChatSidebarHeader({
  onNewChat,
  isCreating,
}: ChatSidebarHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 border-b px-4 py-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MessageSquare className="size-4 shrink-0 text-primary" />
        <h2 className="text-sm font-semibold truncate">Conversations</h2>
      </div>
      <Button
        size="sm"
        onClick={onNewChat}
        disabled={isCreating}
        className="shrink-0 gap-1.5"
      >
        {isCreating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Plus className="size-3.5" />
        )}
        <span className="hidden sm:inline">New</span>
      </Button>
    </div>
  );
}
