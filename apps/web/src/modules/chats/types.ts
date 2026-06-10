import type {
  ChatContextType,
  ChatTopicType,
  ChatRole,
  ChatSession,
  ChatMessage,
} from "@neuralpay/types";

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
