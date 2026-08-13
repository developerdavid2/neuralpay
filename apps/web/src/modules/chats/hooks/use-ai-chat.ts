"use client";

import { useChat } from "@ai-sdk/react";
import { webEnv } from "@neuralpay/env/web";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { ToolPart } from "../ui/components/chat-tool-part";

type ChatMessagePart = { type: "text"; text: string } | ToolPart;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatMessagePart[];
};

function normalizeChatMessages(
  messages: Array<{
    id: string;
    role: string;
    parts?: Array<Record<string, unknown>>;
  }>,
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "assistant" ? "assistant" : "user",
    parts: (message.parts ?? []).flatMap((part): ChatMessagePart[] => {
      if (part.type === "text") {
        return [{ type: "text", text: (part.text as string) ?? "" }];
      }

      // AI SDK v7 tool parts: type is "tool-{name}"
      if (typeof part.type === "string" && part.type.startsWith("tool-")) {
        const tp = part as any;

        // Map AI SDK state → our ToolPart state
        let state: ToolPart["state"];
        if (tp.state === "input-streaming") state = "input-streaming";
        else if (tp.state === "input-available") state = "input-available";
        else if (tp.state === "output-available") state = "output-available";
        else if (tp.state === "output-error") state = "output-error";
        else {
          // Fallback for any other state
          state =
            tp.output !== undefined ? "output-available" : "input-available";
        }

        return [
          {
            toolName: (tp.toolName as string) ?? tp.type.replace("tool-", ""),
            state,
            input: tp.input ?? tp.args,
            output: tp.output ?? tp.result,
            errorText: tp.errorText as string | undefined,
          },
        ];
      }

      return [];
    }),
  }));
}

export function useAIChat({
  sessionId,
  initialMessage,
}: {
  sessionId: string;
  initialMessage?: string;
}) {
  const [input, setInput] = useState("");
  const hasSentInitial = useRef(false);
  const prevSessionId = useRef(sessionId);

  const isLocal = window.location.hostname === "localhost";
  const url = isLocal
    ? `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/ai/chat/stream`
    : `/api/stream/chat`;

  const chat = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: url,
      credentials: "include",
      body: { sessionId },
    }),
  });

  useEffect(() => {
    if (prevSessionId.current !== sessionId) {
      prevSessionId.current = sessionId;
      hasSentInitial.current = false;
      chat.setMessages([]);
      setInput("");
    }
  }, [chat, sessionId]);

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      chat.sendMessage({ text: initialMessage });
    }
  }, [chat, initialMessage]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    chat.sendMessage({ text: trimmed });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const hasPendingToolCall = chat.messages.some(
    (m) =>
      m.role === "assistant" &&
      m.parts?.some((p) => {
        if (typeof p.type !== "string" || !p.type.startsWith("tool-"))
          return false;
        const state = (p as any).state;
        return state !== "output-available" && state !== "output-error";
      }),
  );

  return {
    messages: normalizeChatMessages(chat.messages),
    input,
    handleInputChange,
    handleSubmit,
    isLoading:
      chat.status === "streaming" ||
      chat.status === "submitted" ||
      hasPendingToolCall,
    error: chat.error,
    setMessages: chat.setMessages,
    status: chat.status,
    sendMessage,
  };
}
