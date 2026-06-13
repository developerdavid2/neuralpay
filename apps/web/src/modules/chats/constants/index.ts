import type { ElementType } from "react";
import type { ChatContextType } from "@neuralpay/types";
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

type Suggestion = {
  text: string;
  icon: ElementType;
};

export const contextSuggestions: Record<ChatContextType, Suggestion[]> = {
  general: [
    { text: "Give me a spending overview this month", icon: TrendingUp },
    { text: "Am I on track with my budgets?", icon: Wallet },
    { text: "How can I save more money?", icon: PiggyBank },
    { text: "Show me unusual transactions", icon: AlertTriangle },
  ],
  transaction: [
    {
      text: "Is this merchant expensive compared to my average?",
      icon: TrendingUp,
    },
    { text: "Categorize this differently", icon: Receipt },
    { text: "Hide similar transactions from insights", icon: AlertTriangle },
    { text: "How often do I spend here?", icon: TrendingUp },
  ],
  insight: [
    { text: "Explain this insight in detail", icon: Lightbulb },
    { text: "What transactions triggered this?", icon: Receipt },
    { text: "How can I act on this?", icon: Target },
    { text: "Have I seen similar insights before?", icon: Lightbulb },
  ],
  budget: [
    { text: "How much can I still spend?", icon: Wallet },
    { text: "What categories are eating my budget?", icon: TrendingUp },
    { text: "Adjust my budget allocation", icon: Target },
  ],
  vault: [
    { text: "Am I on track to hit my goal?", icon: Target },
    { text: "When will I reach my target?", icon: TrendingUp },
    { text: "Should I increase contributions?", icon: PiggyBank },
  ],
  split: [
    { text: "Who hasn't paid yet?", icon: Users },
    { text: "Send reminders to participants", icon: Users },
    { text: "How does this affect my budget?", icon: Wallet },
  ],
};
