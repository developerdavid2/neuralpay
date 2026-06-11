"use client";

import { useSessions } from "@/modules/chats/hooks/queries/use-sessions";
import { useChatFilters } from "@/modules/chats/hooks/use-chat-filters";
import { useChatSidebarActions } from "@/modules/chats/hooks/use-chat-sidebar-actions";
import type { ChatTopicType } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { ChatSessionList } from "../chat-session-list";
import { ChatSidebarEmpty } from "./chat-sidebar-empty";
import { ChatSidebarFilters } from "./chat-sidebar-filters";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { DebouncedSearchInput } from "@/components/debounced-search-input";

export const ChatsSidebarPanel = () => {
  const {
    currentSearch,
    currentTopic,
    currentIncludeArchived,
    updateSearch,
    updateTopic,
    clearAllFilters,
  } = useChatFilters();

  const {
    ConfirmDialog,
    handleNewChat,
    handleSelectSession,
    handleArchive,
    handleDelete,
    isArchiving,
    isDeleting,
    isCreating,
  } = useChatSidebarActions();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSessions({
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

  return (
    <div className="flex flex-col h-full">
      {/* Header: Title + New Chat */}
      <ChatSidebarHeader onNewChat={handleNewChat} isCreating={isCreating} />

      {/* Search */}
      <div className="px-3 py-2 border-b">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={updateSearch}
          placeholder="Search chats..."
          className="h-8"
        />
      </div>

      {/* Topic Filters - Button style like transaction filters */}
      <ChatSidebarFilters
        selectedTopic={currentTopic}
        onTopicChange={updateTopic}
        onClearFilters={clearAllFilters}
        hasActiveFilters={!!currentTopic || !!currentSearch}
      />

      {/* Session List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sessions.length > 0 ? (
          <ChatSessionList
            sessions={sessions}
            onSelect={handleSelectSessionWithParams}
            onArchive={(sessionId, title) => handleArchive(sessionId, title)}
            onDelete={(sessionId, title) => handleDelete(sessionId, title)}
            isArchiving={isArchiving}
            isDeleting={isDeleting}
          />
        ) : (
          <ChatSidebarEmpty onNewChat={handleNewChat} />
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="mr-1.5 size-3 animate-spin" />
              ) : null}
              Load more
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};
