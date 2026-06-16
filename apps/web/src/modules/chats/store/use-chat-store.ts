import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";

interface ChatUIState {
  sessionSidebarOpen: boolean;
  setSessionSidebarOpen: (open: boolean) => void;

  selectedTopic: ChatTopicType | "all";
  setSelectedTopic: (topic: ChatTopicType | "all") => void;

  selectedContext: ChatContextType | "all";
  setSelectedContext: (context: ChatContextType | "all") => void;

  inputText: string;
  setInputText: (text: string) => void;

  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatUIState>()(
  devtools(
    (set) => ({
      sessionSidebarOpen: true,
      setSessionSidebarOpen: (open) => set({ sessionSidebarOpen: open }),

      selectedTopic: "all",
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      selectedContext: "all",
      setSelectedContext: (context) => set({ selectedContext: context }),

      inputText: "",
      setInputText: (text) => set({ inputText: text }),

      isStreaming: false,
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
    }),
    { name: "ai-chat-store" },
  ),
);
