"use client";

import { Bot } from "lucide-react";
import { useSessionDetails } from "../../hooks/queries/use-session-details";
import { useAIChat } from "../../hooks/use-ai-chat";
import { ChatContextPill } from "./chat-context-pill";

import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@neuralpay/ui/components/ai-elements/conversation";
import { Avatar, AvatarFallback } from "@neuralpay/ui/components/avatar";
import { Button } from "@neuralpay/ui/components/button";
import { AlertCircle, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { useUnarchiveSession } from "../../hooks/mutations/use-unarchive-session";
import { useMessages } from "../../hooks/queries/use-messages";
import { ChatInput } from "./chat-input";
import { ChatMessageItem } from "./chat-message-item";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { CHAT_SESSION_MESSAGES } from "../../constants";

interface Props {
  sessionId: string;
  initialMessage?: string;
}

export function ChatConversationArea({ sessionId, initialMessage }: Props) {
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
  const archivedAt = sessionData?.session.archivedAt;
  const isArchived = archivedAt !== null && archivedAt !== undefined;

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(sessionId, CHAT_SESSION_MESSAGES);

  const {
    messages: streamingMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useAIChat({ sessionId, initialMessage });

  const unarchiveSession = useUnarchiveSession();

  const persistedMessages =
    messagesData?.pages
      .slice()
      .reverse()
      .flatMap((page) => page.items) ?? [];

  const handleUnarchive = () => {
    unarchiveSession.mutate(
      { sessionId },
      {
        onSuccess: () => toast.success("Conversation unarchived"),
        onError: () => toast.error("Failed to unarchive"),
      },
    );
  };

  return (
    <>
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {sessionData?.session.title ?? "Chat"}
          </h2>
          {sessionData?.session.contextType !== "general" && (
            <ChatContextPill sessionId={sessionId} />
          )}
        </div>
      </header>

      <div className="flex h-full flex-col w-4xl mx-auto ">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="p-4 space-y-4">
            <InfiniteScroll
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              isManual={false}
              hideEndMessage
              isLoading={false}
            />

            {persistedMessages.map((message) => (
              <ChatMessageItem key={message.id} message={message} />
            ))}

            {!isArchived &&
              streamingMessages.map((message) => {
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

            {isLoading &&
              streamingMessages[streamingMessages.length - 1]?.role ===
                "user" && (
                <div className="flex gap-3 flex-row">
                  <Avatar className="size-8 shrink-0 bg-muted">
                    <AvatarFallback>
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="shrink-0 border-t p-4 pb-12 space-y-3">
          {isArchived ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-sm text-muted-foreground text-center">
                This conversation is archived. To continue, please unarchive it
                first.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnarchive}
                disabled={unarchiveSession.isPending}
                className="gap-2"
              >
                {unarchiveSession.isPending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArchiveRestore className="size-4" />
                )}
                Unarchive
              </Button>
            </div>
          ) : (
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
}

export function ChatConversationSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center border-b px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </header>

      {/* Message Area */}
      <div className="flex h-full flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 p-4 space-y-12 overflow-y-auto no-scrollbar">
          {/* Assistant message */}
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[50%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[50%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[40%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[30%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[30%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[20%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[50%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[70%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[20%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[40%]">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>

        {/* Real ChatInput but fully disabled */}
        <div className="shrink-0 border-t p-4 pb-12 space-y-3 pointer-events-none opacity-50">
          <ChatInput
            input=""
            isLoading={false}
            onInputChange={() => {}}
            onSubmit={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
