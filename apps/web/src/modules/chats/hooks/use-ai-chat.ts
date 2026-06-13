import { useChat } from "@ai-sdk/react";
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

  const chat = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "http://localhost:4000/v1/ai/chat/stream",
      credentials: "include",
      body: { sessionId },
    }),
  });

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
  };
}
