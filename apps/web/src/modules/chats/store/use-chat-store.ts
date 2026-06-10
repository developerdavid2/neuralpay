import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";

interface ChatUIState {
  // Active session
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter
  selectedTopic: ChatTopicType | "all";
  setSelectedTopic: (topic: ChatTopicType | "all") => void;

  // Context for new chat
  pendingContext: {
    contextType: ChatContextType;
    contextId?: string;
    title?: string;
  } | null;
  setPendingContext: (ctx: ChatUIState["pendingContext"]) => void;
  clearPendingContext: () => void;

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
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Search
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Filter
      selectedTopic: "all",
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      // Pending context
      pendingContext: null,
      setPendingContext: (ctx) => set({ pendingContext: ctx }),
      clearPendingContext: () => set({ pendingContext: null }),

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
