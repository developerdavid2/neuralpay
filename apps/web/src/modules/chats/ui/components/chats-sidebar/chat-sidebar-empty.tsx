"use client";

import { Button } from "@neuralpay/ui/components/button";
import { MessageSquare, Plus } from "lucide-react";

interface ChatSidebarEmptyProps {
  onNewChat: () => void;
}

export function ChatSidebarEmpty({ onNewChat }: ChatSidebarEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-muted mb-3">
        <MessageSquare className="size-5 text-muted-foreground" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        No conversations
      </p>
      <p className="text-[10px] text-muted-foreground/70 mt-0.5 mb-3">
        Start a new chat to get AI insights
      </p>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={onNewChat}
      >
        <Plus className="size-3" />
        New Chat
      </Button>
    </div>
  );
}
