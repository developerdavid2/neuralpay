"use client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { contextSuggestions } from "../../constants";
import { useStartSession } from "../../hooks/mutations/use-start-session";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";

export const NewChatConversationArea = () => {
  const router = useRouter();
  const startSession = useStartSession();
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || startSession.isPending) return;

    const session = await startSession.mutateAsync({
      contextType: "general",
      topic: "general",
      title: input.slice(0, 50),
    });

    router.push(
      `/dashboard/ai-chat/${session.id}?initialMessage=${encodeURIComponent(input)}` as Route,
    );
  }, [input, startSession, router]);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <ChatSuggestions
        suggestions={contextSuggestions.general}
        onSuggestionClick={(text) => {
          setInput(text);
        }}
      />
      <ChatInput
        input={input}
        isLoading={startSession.isPending}
        onInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
