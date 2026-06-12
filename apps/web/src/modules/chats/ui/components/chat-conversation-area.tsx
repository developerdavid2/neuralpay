// chat-conversation-area.tsx
"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { useSessionDetails } from "../../hooks/queries/use-session-details";
import { ChatContextPill } from "./chat-context-pill";
import { useAIChat } from "../../hooks/use-ai-chat";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@neuralpay/ui/components/ai-elements/conversation";
import { Button } from "@neuralpay/ui/components/button";
import { AlertCircle } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ChatMessageItem } from "./chat-message-item";
import { useMessages } from "../../hooks/queries/use-messages";

interface Props {
  sessionId: string;
}

export function ChatConversationArea({ sessionId }: Props) {
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

  const { sessionData } = useSessionDetails(sessionId);
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(sessionId);

  // useChat owns the streaming state — lives here so both messages + input share it
  const {
    messages: streamingMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useAIChat({ sessionId });

  const persistedMessages =
    messagesData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {sessionData?.session.title ?? "Chat"}
          </h2>
          {sessionData?.session.contextType !== "general" && (
            <ChatContextPill />
          )}
        </div>
      </header>

      <div className="flex h-full flex-col max-w-4xl mx-auto">
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

            {/* Persisted messages from tRPC (history) */}
            {persistedMessages.map((message) => (
              <ChatMessageItem key={message.id} message={message} />
            ))}

            {/* Live streaming messages from useChat */}
            {streamingMessages.map((message) => {
              const textContent = message.parts
                .filter((p) => p.type === "text")
                .map((p) => (p as { type: "text"; text: string }).text)
                .join("");

              return (
                <ChatMessageItem
                  key={message.id}
                  message={{
                    id: message.id,
                    role: message.role as "user" | "assistant",
                    content: textContent,
                    createdAt: new Date(),
                    sessionId,
                    userId: "",
                    tokensUsed: null,
                    metadata: null,
                  }}
                />
              );
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suspense fallback={<div className="shrink-0 border-t p-4 h-20" />}>
          <div className="shrink-0 border-t p-4 space-y-3">
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>
        </Suspense>
      </div>
    </>
  );
}
