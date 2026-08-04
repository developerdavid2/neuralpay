import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { webEnv } from "@neuralpay/env/web";
import { useEffect, useRef, useState } from "react";

type ChatMessagePart = {
  type: "text";
  text: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatMessagePart[];
};

function normalizeChatMessages(
  messages: Array<{
    id: string;
    role: string;
    parts?: Array<{ type?: string; text?: string }>;
  }>,
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "assistant" ? "assistant" : "user",
    parts: (message.parts ?? [])
      .filter((part) => part.type === "text")
      .map((part) => ({
        type: "text",
        text: part.text ?? "",
      })),
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

  return {
    messages: normalizeChatMessages(chat.messages),
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chat.status === "streaming" || chat.status === "submitted",
    error: chat.error,
    setMessages: chat.setMessages,
    status: chat.status,
  };
}
