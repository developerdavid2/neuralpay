import { InfiniteScroll } from "@/components/infinite-scroll";
import type { ChatSession } from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Calendar, Clock } from "lucide-react";
import { groupSessionsByDate } from "../../lib/utils";
import { useChatStore } from "../../store/use-chat-store";
import { ChatSessionItem, ChatSessionItemSkeleton } from "./chat-session-item";
import { useParams } from "next/navigation";

interface ChatSessionListProps {
  sessions: ChatSession[];
  onSelect: (sessionId: string, contextType?: string, topic?: string) => void;
  onArchive: (sessionId: string, title: string) => void;
  onDelete: (sessionId: string, title: string) => void;
  fetchNextPage: () => void;
  isArchiving: boolean;
  isDeleting: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
}

export function ChatSessionList({
  sessions,
  onSelect,
  onArchive,
  onDelete,
  isArchiving,
  isDeleting,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isRefetching,
}: ChatSessionListProps) {
  const params = useParams();
  const activeSessionId = params.sessionId as string | undefined;
  const { recent, earlier } = groupSessionsByDate(sessions);

  if (isRefetching) {
    return <ChatSessionListSkeleton />;
  }

  return (
    <div className="px-2 py-1 space-y-3">
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

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={false}
        isManual={false}
      />
    </div>
  );
}

export function ChatSessionListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="px-2 py-1 space-y-3">
      <div>
        <div className="px-2.5 py-1.5 flex items-center gap-1">
          <Skeleton className="size-3 rounded" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-0.5">
          {Array.from({ length: Math.ceil(count * 0.6) }).map((_, i) => (
            <ChatSessionItemSkeleton key={i} />
          ))}
        </div>
      </div>

      <div>
        <div className="px-2.5 py-1.5 flex items-center gap-1">
          <Skeleton className="size-3 rounded" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="space-y-0.5">
          {Array.from({ length: Math.floor(count * 0.4) }).map((_, i) => (
            <ChatSessionItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
