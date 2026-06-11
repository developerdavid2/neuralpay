"use client";

import { ChatSessionItem } from "./chat-session-item";
import { Clock, Calendar } from "lucide-react";
import type { ChatSession } from "@neuralpay/types";
import { groupSessionsByDate } from "../../lib/utils";
import { useChatStore } from "../../store/use-chat-store";

interface ChatSessionListProps {
  sessions: ChatSession[];
  onSelect: (sessionId: string, contextType?: string, topic?: string) => void;
  onArchive: (sessionId: string, title: string) => void;
  onDelete: (sessionId: string, title: string) => void;
  isArchiving: boolean;
  isDeleting: boolean;
}

export function ChatSessionList({
  sessions,
  onSelect,
  onArchive,
  onDelete,
  isArchiving,
  isDeleting,
}: ChatSessionListProps) {
  const { activeSessionId } = useChatStore();
  const { recent, earlier } = groupSessionsByDate(sessions);

  return (
    <div className="px-2 py-1 space-y-3">
      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <h3 className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            Recent
          </h3>
          <div className="space-y-0.5">
            {recent.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                isArchiving={isArchiving}
                isDeleting={isDeleting}
                onSelect={onSelect}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Earlier */}
      {earlier.length > 0 && (
        <div>
          <h3 className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            Earlier
          </h3>
          <div className="space-y-0.5">
            {earlier.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                isArchiving={isArchiving}
                isDeleting={isDeleting}
                onSelect={onSelect}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
