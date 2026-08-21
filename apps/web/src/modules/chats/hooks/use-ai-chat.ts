"use client";

import { useChat } from "@ai-sdk/react";
import { DEFAULT_CHAT_MODEL_ID, type ToolMode } from "@orra/types";
import type { SupportedChatModelId } from "@orra/types";
import { webEnv } from "@orra/env/web";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { normalizeChatMessages } from "../lib/message-parts";

export type { ChatMessage } from "../lib/message-parts";

export type ChatMode = ToolMode;

export function useAIChat({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("plan");
  const [model, setModel] = useState<SupportedChatModelId>(DEFAULT_CHAT_MODEL_ID);
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
      body: { sessionId, mode, model },
    }),
  });

  useEffect(() => {
    if (prevSessionId.current !== sessionId) {
      prevSessionId.current = sessionId;
      chat.setMessages([]);
      setInput("");
    }
  }, [chat, sessionId]);

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
    mode,
    setMode,
    model,
    setModel,
  };
}
