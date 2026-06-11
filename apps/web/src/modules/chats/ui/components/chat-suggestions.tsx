"use client";

import { useMemo } from "react";

import {
  Suggestions,
  Suggestion,
} from "@neuralpay/ui/components/ai-elements/suggestion";
import {
  TrendingUp,
  Receipt,
  Lightbulb,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Target,
  Users,
} from "lucide-react";
import type { ChatContextType } from "@neuralpay/types";
import { useChatStore } from "../../store/use-chat-store";
import { useSessionDetails } from "../../hooks/queries/use-session-details";

const contextSuggestions: Record<
  ChatContextType,
  Array<{ text: string; icon: React.ReactNode }>
> = {
  general: [
    {
      text: "Give me a spending overview this month",
      icon: <TrendingUp className="size-4" />,
    },
    {
      text: "Am I on track with my budgets?",
      icon: <Wallet className="size-4" />,
    },
    {
      text: "How can I save more money?",
      icon: <PiggyBank className="size-4" />,
    },
    {
      text: "Show me unusual transactions",
      icon: <AlertTriangle className="size-4" />,
    },
  ],
  transaction: [
    {
      text: "Is this merchant expensive compared to my average?",
      icon: <TrendingUp className="size-4" />,
    },
    {
      text: "Categorize this differently",
      icon: <Receipt className="size-4" />,
    },
    {
      text: "Hide similar transactions from insights",
      icon: <AlertTriangle className="size-4" />,
    },
    {
      text: "How often do I spend here?",
      icon: <TrendingUp className="size-4" />,
    },
  ],
  insight: [
    {
      text: "Explain this insight in detail",
      icon: <Lightbulb className="size-4" />,
    },
    {
      text: "What transactions triggered this?",
      icon: <Receipt className="size-4" />,
    },
    { text: "How can I act on this?", icon: <Target className="size-4" /> },
    {
      text: "Have I seen similar insights before?",
      icon: <Lightbulb className="size-4" />,
    },
  ],
  budget: [
    {
      text: "How much can I still spend?",
      icon: <Wallet className="size-4" />,
    },
    {
      text: "What categories are eating my budget?",
      icon: <TrendingUp className="size-4" />,
    },
    {
      text: "Adjust my budget allocation",
      icon: <Target className="size-4" />,
    },
  ],
  vault: [
    {
      text: "Am I on track to hit my goal?",
      icon: <Target className="size-4" />,
    },
    {
      text: "When will I reach my target?",
      icon: <TrendingUp className="size-4" />,
    },
    {
      text: "Should I increase contributions?",
      icon: <PiggyBank className="size-4" />,
    },
  ],
  split: [
    { text: "Who hasn't paid yet?", icon: <Users className="size-4" /> },
    {
      text: "Send reminders to participants",
      icon: <Users className="size-4" />,
    },
    {
      text: "How does this affect my budget?",
      icon: <Wallet className="size-4" />,
    },
  ],
};

interface ChatSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  const { activeSessionId } = useChatStore();

  // Don't attempt to fetch session details if activeSessionId is not available
  if (!activeSessionId || typeof activeSessionId !== "string") {
    return null;
  }

  const { sessionData } = useSessionDetails(activeSessionId);

  const suggestions = useMemo(() => {
    const contextType = sessionData?.session.contextType ?? "general";
    return contextSuggestions[contextType] ?? contextSuggestions.general;
  }, [sessionData]);

  return (
    <Suggestions className="flex flex-wrap gap-2">
      {suggestions.map((s, i) => (
        <Suggestion
          key={i}
          suggestion={s.text}
          onClick={() => onSuggestionClick(s.text)}
          className="flex items-center gap-2"
        >
          {s.icon}
          <span>{s.text}</span>
        </Suggestion>
      ))}
    </Suggestions>
  );
}
