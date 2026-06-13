"use client";

import type { ChatMessage } from "@neuralpay/types";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@neuralpay/ui/components/ai-elements/message";
import { Avatar, AvatarFallback } from "@neuralpay/ui/components/avatar";
import { cn } from "@neuralpay/ui/lib/utils";
import { Bot, User } from "lucide-react";
import { sanitizeMessageContent } from "../../lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const sanitizedContent = sanitizeMessageContent(message.content);

  return (
    <Message
      from={isUser ? "user" : "assistant"}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <Avatar
        className={cn("size-8 shrink-0", isUser ? "bg-primary" : "bg-muted")}
      >
        <AvatarFallback>
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <MessageContent
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary! text-primary-foreground!"
            : "bg-sidebar text-foreground",
        )}
      >
        {message.role === "assistant" ? (
          <MessageResponse>{sanitizedContent}</MessageResponse>
        ) : (
          sanitizedContent
        )}
      </MessageContent>
    </Message>
  );
}
