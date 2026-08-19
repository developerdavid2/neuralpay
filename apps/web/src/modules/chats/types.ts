import type { ChatContextType, ChatMessage, ChatSession } from "@orra/types";

export interface SessionWithMessages {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface SuggestionPrompt {
  id: string;
  text: string;
  icon?: string;
}

export interface ContextPillData {
  contextType: ChatContextType;
  contextId: string;
  label: string;
  subtitle?: string;
}
