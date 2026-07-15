import { useChat } from "@ai-sdk/react";
import { webEnv } from "@neuralpay/env/web";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

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

  const chat = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/ai/chat/stream`,
      credentials: "include",
      body: { sessionId },
    }),
  });

  useEffect(() => {
    if (prevSessionId.current !== sessionId) {
      prevSessionId.current = sessionId;
      hasSentInitial.current = false;
      if (chat.messages.length > 0) {
        chat.setMessages([]);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      chat.sendMessage({ text: initialMessage });
    }
  }, [initialMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    chat.sendMessage({ text: input });
    setInput("");
  };

  return {
    messages: chat.messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chat.status === "submitted" || chat.status === "streaming",
    error: chat.error,
    setMessages: chat.setMessages,
    status: chat.status,
  };
}
