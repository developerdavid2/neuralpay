"use client";

import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { SectionBoundary } from "@/components/section-boundary";
import { CHAT_SESSIONS_LIMIT } from "@/modules/chats/constants";
import { useSessions } from "@/modules/chats/hooks/queries/use-sessions";
import { useChatFilters } from "@/modules/chats/hooks/use-chat-filters";
import { useChatSidebarActions } from "@/modules/chats/hooks/use-chat-sidebar-actions";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { useCallback, useState } from "react";
import { ChatSessionList, ChatSessionListSkeleton } from "../chat-session-list";

import { ChatSidebarEmpty } from "./chat-sidebar-empty";
import { ChatSidebarFilters } from "./chat-sidebar-filters";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarArchiveSheet } from "./chat-sidebar-archive-sheet";

function ChatSessionListSection({
  handleSelectSession,
  handleNewChat,
}: {
  handleSelectSession: (
    sessionId: string,
    contextType?: string,
    topic?: string,
  ) => void;
  handleNewChat: () => void;
}) {
  const {
    currentSearch,
    currentTopic,
    currentContextType,
    currentIncludeArchived,
  } = useChatFilters();

  const {
    sessions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useSessions({
    search: currentSearch || undefined,
    topic: (currentTopic as ChatTopicType) || undefined,
    contextType: (currentContextType as ChatContextType) || undefined,
    includeArchived: currentIncludeArchived,
    limit: CHAT_SESSIONS_LIMIT,
  });

  const handleSelectSessionWithParams = useCallback(
    (sessionId: string, contextType?: string, topic?: string) => {
      handleSelectSession(sessionId, contextType, topic);
    },
    [handleSelectSession],
  );

  if (sessions.length === 0 && isRefetching) {
    return <ChatSessionListSkeleton />;
  }

  if (sessions.length === 0) {
    return <ChatSidebarEmpty onNewChat={handleNewChat} />;
  }

  return (
    <ChatSessionList
      sessions={sessions}
      onSelect={handleSelectSessionWithParams}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export const ChatsSidebarPanel = () => {
  const [archiveSheetOpen, setArchiveSheetOpen] = useState(false);

  const {
    currentSearch,
    currentTopic,
    currentContextType,
    currentIncludeArchived,
    updateSearch,
    updateTopic,
    updateContextType,
    clearAllFilters,
    hasActiveFilters,
  } = useChatFilters();

  const { handleNewChat, isCreating, handleSelectSession } =
    useChatSidebarActions();

  // Fetch ALL sessions (including archived) to get archive count
  // We use a lightweight query — no need for full pagination here
  const { sessions: allSessions } = useSessions({
    includeArchived: true,
    limit: 100, // Reasonable limit for count
  });

  const archivedCount = allSessions.filter((s) => s.archivedAt !== null).length;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <ChatSidebarHeader onNewChat={handleNewChat} isCreating={isCreating} />

        <div className="px-3 py-2 border-b shrink-0">
          <DebouncedSearchInput
            value={currentSearch}
            onSearch={updateSearch}
            placeholder="Search chats..."
            className="h-8"
          />
        </div>

        <div className="shrink-0">
          <ChatSidebarFilters
            selectedTopic={currentTopic as ChatTopicType}
            selectedContextType={currentContextType as ChatContextType}
            onTopicChange={updateTopic}
            onContextTypeChange={updateContextType}
            onClearFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            archivedCount={archivedCount}
            onOpenArchive={() => setArchiveSheetOpen(true)}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
          <SectionBoundary
            key={`${currentSearch}-${currentTopic}-${currentContextType}-${currentIncludeArchived}`}
            fallback={<ChatSessionListSkeleton />}
            errorMessage="Could not load conversations"
          >
            <ChatSessionListSection
              handleSelectSession={handleSelectSession}
              handleNewChat={handleNewChat}
            />
          </SectionBoundary>
        </div>
      </div>

      <ChatSidebarArchiveSheet
        open={archiveSheetOpen}
        onOpenChange={setArchiveSheetOpen}
      />
    </>
  );
};

export const ChatSidebarPanelSkeleton = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="size-7 rounded-md" />
      </div>
      <div className="px-3 py-2 border-b">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      <div className="px-3 py-2 flex gap-1.5 border-b">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatSessionListSkeleton />
      </div>
    </div>
  );
};
