// chats-sidebar-panel.tsx
"use client";

import { useSessions } from "@/modules/chats/hooks/queries/use-sessions";
import { useChatFilters } from "@/modules/chats/hooks/use-chat-filters";
import { useChatSidebarActions } from "@/modules/chats/hooks/use-chat-sidebar-actions";
import { SectionBoundary } from "@/components/section-boundary";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";
import { useCallback } from "react";
import { ChatSessionList, ChatSessionListSkeleton } from "../chat-session-list";
import { ChatSidebarEmpty } from "./chat-sidebar-empty";
import { ChatSidebarFilters } from "./chat-sidebar-filters";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { Skeleton } from "@neuralpay/ui/components/skeleton";

function ChatSessionListSection() {
  const { currentSearch, currentTopic, currentIncludeArchived } =
    useChatFilters();

  const {
    handleSelectSession,
    handleArchive,
    handleDelete,
    isArchiving,
    isDeleting,
  } = useChatSidebarActions();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useSessions({
      search: currentSearch || undefined,
      topic: (currentTopic as ChatTopicType) || undefined,
      includeArchived: currentIncludeArchived,
      limit: 30,
    });

  const sessions = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSelectSessionWithParams = useCallback(
    (sessionId: string, contextType?: string, topic?: string) => {
      handleSelectSession(sessionId, contextType, topic);
    },
    [handleSelectSession],
  );

  if (isRefetching) {
    return <ChatSessionListSkeleton />;
  }

  if (sessions.length === 0) {
    return <ChatSidebarEmpty onNewChat={() => {}} />;
  }

  return (
    <ChatSessionList
      sessions={sessions}
      onSelect={handleSelectSessionWithParams}
      onArchive={(sessionId, title) => handleArchive(sessionId, title)}
      onDelete={(sessionId, title) => handleDelete(sessionId, title)}
      isArchiving={isArchiving}
      isDeleting={isDeleting}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      isRefetching={isRefetching}
      fetchNextPage={fetchNextPage}
    />
  );
}

export const ChatsSidebarPanel = () => {
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

  const { ConfirmDialog, handleNewChat, isCreating } = useChatSidebarActions();

  return (
    <div className="flex flex-col h-full">
      <ChatSidebarHeader onNewChat={handleNewChat} isCreating={isCreating} />

      <div className="px-3 py-2 border-b">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={updateSearch}
          placeholder="Search chats..."
          className="h-8"
        />
      </div>

      <ChatSidebarFilters
        selectedTopic={currentTopic as ChatTopicType}
        selectedContextType={currentContextType as ChatContextType}
        onTopicChange={updateTopic}
        onContextTypeChange={updateContextType}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        <SectionBoundary
          key={`${currentSearch}-${currentTopic}-${currentContextType}-${currentIncludeArchived}`}
          fallback={<ChatSessionListSkeleton />}
          errorMessage="Could not load conversations"
        >
          <ChatSessionListSection />
        </SectionBoundary>
      </div>

      <ConfirmDialog />
    </div>
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
