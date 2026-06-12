import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";

interface ChatUIState {
  // Active session
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // Sidebar
  sessionSidebarOpen: boolean;
  setSessionSidebarOpen: (open: boolean) => void;

  // Filter topic
  selectedTopic: ChatTopicType | "all";
  setSelectedTopic: (topic: ChatTopicType | "all") => void;

  // filter context
  selectedContext: ChatContextType | "all";
  setSelectedContext: (context: ChatContextType | "all") => void;

  // Input state (lifted for AI Elements)
  inputText: string;
  setInputText: (text: string) => void;

  // Streaming state (Phase 3)
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatUIState>()(
  devtools(
    (set) => ({
      // Active session
      activeSessionId: null,
      setActiveSessionId: (id) => set({ activeSessionId: id }),

      // Sidebar
      sessionSidebarOpen: true,
      setSessionSidebarOpen: (open) => set({ sessionSidebarOpen: open }),

      // Filter topic
      selectedTopic: "all",
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      // context
      selectedContext: "all",
      setSelectedContext: (context) => set({ selectedContext: context }),

      // Input
      inputText: "",
      setInputText: (text) => set({ inputText: text }),

      // Streaming
      isStreaming: false,
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
    }),
    { name: "ai-chat-store" },
  ),
);
