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

interface ChatMessageItemProps {
  message: ChatMessage;
}

/**
 * Sanitize message content to prevent script tag rendering
 * Removes or escapes potentially dangerous HTML content
 */
function sanitizeMessageContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // Remove script tags and their content completely
  let sanitized = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
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
            : "bg-muted text-foreground",
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
