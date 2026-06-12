import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export function useAIChat({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");

  const chat = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "http://localhost:4000/v1/ai/chat/stream",
      credentials: "include",
      body: { sessionId },
    }),
  });

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
