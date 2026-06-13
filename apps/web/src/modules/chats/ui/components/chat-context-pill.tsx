"use client";

import { Info, Lightbulb, Receipt, Split, Vault, Wallet } from "lucide-react";

import type { ChatContextType } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@neuralpay/ui/components/tooltip";
import { cn } from "@neuralpay/ui/lib/utils";
import { useSessionDetails } from "../../hooks/queries/use-session-details";

const contextConfig: Record<
  ChatContextType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  general: {
    icon: <Info className="size-3" />,
    label: "General",
    color: "bg-muted",
  },
  insight: {
    icon: <Lightbulb className="size-3" />,
    label: "Insight",
    color: "bg-amber-100 text-amber-700",
  },
  transaction: {
    icon: <Receipt className="size-3" />,
    label: "Transaction",
    color: "bg-blue-100 text-blue-700",
  },
  budget: {
    icon: <Wallet className="size-3" />,
    label: "Budget",
    color: "bg-green-100 text-green-700",
  },
  vault: {
    icon: <Vault className="size-3" />,
    label: "Vault",
    color: "bg-purple-100 text-purple-700",
  },
  split: {
    icon: <Split className="size-3" />,
    label: "Split",
    color: "bg-orange-100 text-orange-700",
  },
};

interface ChatContextPillProps {
  sessionId: string;
}
export function ChatContextPill({ sessionId }: ChatContextPillProps) {
  const activeSessionId = sessionId;
  const { sessionData } = useSessionDetails(activeSessionId ?? "");

  if (!sessionData || sessionData.session.contextType === "general") {
    return null;
  }

  const { contextType, contextId } = sessionData.session;
  const config = contextConfig[contextType!];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "gap-1.5 px-2.5 py-1 text-xs font-medium cursor-help",
              config.color,
            )}
          >
            {config.icon}
            <span>
              {config.label}
              {contextId && `: ${contextId.slice(0, 8)}...`}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            This conversation is contextualized with your{" "}
            <span className="font-semibold capitalize">{contextType}</span>{" "}
            data.
            <br />
            The AI can see relevant financial information to provide better
            answers.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
