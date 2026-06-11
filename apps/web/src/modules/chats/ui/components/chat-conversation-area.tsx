"use client";

import { Loader2, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Suspense } from "react";
import { useMessages } from "../../hooks/queries/use-messages";
import { useSessionDetails } from "../../hooks/queries/use-session-details";
import { useChatStore } from "../../store/use-chat-store";
import { ChatContextPill } from "./chat-context-pill";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@neuralpay/ui/components/ai-elements/conversation";
import { Button } from "@neuralpay/ui/components/button";
import { AlertCircle } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ChatMessageItem } from "./chat-message-item";

interface Props {
  sessionId: string;
}

export function ChatConversationArea({ sessionId }: Props) {
  // Validate sessionId before making queries
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="size-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Invalid session. Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  const { sessionSidebarOpen, toggleSessionSidebar } = useChatStore();

  const { sessionData } = useSessionDetails(sessionId);
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(sessionId);

  const messages = messagesData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {sessionData?.session.title ?? "Chat"}
          </h2>
          {sessionData?.session.contextType !== "general" && (
            <ChatContextPill />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSessionSidebar}
          className="shrink-0"
        >
          {sessionSidebarOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </Button>
      </header>
      <div className="flex h-full flex-col max-w-4xl mx-auto">
        {/* Messages */}
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="p-4 space-y-4">
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="mr-2 size-3 animate-spin" />
                  ) : null}
                  Load older messages
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessageItem key={message.id} message={message} />
            ))}

            {messages.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Start the conversation by sending a message below
                </p>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input section with Suspense boundary for async data loading */}
        <Suspense fallback={<div className="shrink-0 border-t p-4 h-20" />}>
          <div className="shrink-0 border-t p-4 space-y-3">
            <ChatInput />
          </div>
        </Suspense>
      </div>
    </>
  );
}
