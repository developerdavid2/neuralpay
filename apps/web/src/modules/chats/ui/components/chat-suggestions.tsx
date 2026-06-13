"use client";

import type { ChatContextType } from "@neuralpay/types";
import {
  Suggestion,
  Suggestions,
} from "@neuralpay/ui/components/ai-elements/suggestion";
import { useMemo, type ElementType } from "react";
import { contextSuggestions } from "../../constants";
import { useSessionDetails } from "../../hooks/queries/use-session-details";
import { useChatStore } from "../../store/use-chat-store";
import { useParams } from "next/navigation";

interface ChatSuggestionsProps {
  onSuggestionClick: (text: string) => void;
  suggestions?: Array<{ text: string; icon: ElementType }>;
}

function SessionSuggestions({
  sessionId,
  onSuggestionClick,
}: {
  sessionId: string;
  onSuggestionClick: (text: string) => void;
}) {
  const { sessionData } = useSessionDetails(sessionId);

  const suggestions = useMemo(() => {
    const contextType = (sessionData?.session.contextType ??
      "general") as ChatContextType;
    return contextSuggestions[contextType] ?? contextSuggestions.general;
  }, [sessionData]);

  return (
    <SuggestionsList
      suggestions={suggestions}
      onSuggestionClick={onSuggestionClick}
    />
  );
}

function SuggestionsList({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: Array<{ text: string; icon: ElementType }>;
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <Suggestions className="flex flex-wrap gap-2">
      {suggestions.map((s, i) => {
        const Icon = s.icon;
        return (
          <Suggestion
            key={i}
            suggestion={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-center gap-2"
          >
            <Icon className="size-4" />
            <span>{s.text}</span>
          </Suggestion>
        );
      })}
    </Suggestions>
  );
}

// Main export
export function ChatSuggestions({
  onSuggestionClick,
  suggestions: propSuggestions,
}: ChatSuggestionsProps) {
  const params = useParams();
  const activeSessionId = params.sessionId as string | undefined;

  // Prop suggestions take priority — no session needed
  if (propSuggestions) {
    return (
      <SuggestionsList
        suggestions={propSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  // No session and no prop suggestions — show general
  if (!activeSessionId) {
    return (
      <SuggestionsList
        suggestions={contextSuggestions.general}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  // Has session — fetch context-aware suggestions
  return (
    <SessionSuggestions
      sessionId={activeSessionId}
      onSuggestionClick={onSuggestionClick}
    />
  );
}
