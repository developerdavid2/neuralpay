"use client";

import {
  MessageContent,
  MessageResponse,
} from "@orra/ui/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@orra/ui/components/ai-elements/reasoning";
import { Avatar, AvatarFallback } from "@orra/ui/components/avatar";
import { cn } from "@orra/ui/lib/utils";
import { Bot } from "lucide-react";
import type { ChatMessage } from "../../hooks/use-ai-chat";
import { ChatMessageItem } from "./chat-message-item";
import { ChatToolPart } from "./chat-tool-part";

interface ChatStreamMessageProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  sendMessage: (text: string) => void;
}

/**
 * Renders a live message part-by-part, preserving the order the model
 * emitted them in (reasoning → text → tool calls → text …) so steps are
 * visible instead of text/tool being grouped apart.
 */
export function ChatStreamMessage({
  message,
  isLast,
  isStreaming,
  sendMessage,
}: ChatStreamMessageProps) {
  // User messages only carry text — reuse the regular bubble.
  if (message.role === "user") {
    const text = message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");

    return (
      <ChatMessageItem
        message={{
          id: message.id,
          role: "user",
          content: text,
          createdAt: new Date(),
          sessionId: "",
          userId: "",
          tokensUsed: null,
          metadata: null,
        }}
      />
    );
  }

  const lastPartIndex = message.parts.length - 1;
  const lastPart = message.parts[lastPartIndex];

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0 bg-muted">
        <AvatarFallback>
          <Bot className="size-4" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 max-w-[80%] flex-1 space-y-2">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <MessageContent
                key={`${message.id}-${index}`}
                className={cn(
                  "w-fit rounded-2xl bg-sidebar px-4 py-3 text-foreground",
                )}
              >
                <MessageResponse>{part.text}</MessageResponse>
              </MessageContent>
            );
          }

          if (part.type === "reasoning") {
            const isReasoningStreaming =
              isLast &&
              isStreaming &&
              index === lastPartIndex &&
              lastPart?.type === "reasoning";
            // Thoughts are only shown while they are actively streaming in;
            // once the final response is out (or the message is persisted)
            // they are hidden.
            if (!isReasoningStreaming) return null;
            return (
              <Reasoning
                key={`${message.id}-${index}`}
                className="w-full"
                isStreaming={isReasoningStreaming}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          }

          if ("toolName" in part) {
            return (
              <ChatToolPart
                key={`${message.id}-${index}`}
                part={part}
                sendMessage={sendMessage}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
