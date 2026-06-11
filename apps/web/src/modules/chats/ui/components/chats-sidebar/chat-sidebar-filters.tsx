"use client";

import { Button } from "@neuralpay/ui/components/button";
import {
  MessageSquare,
  Wallet,
  TrendingUp,
  PiggyBank,
  Sparkles,
  X,
} from "lucide-react";

import type { ChatTopicType } from "@neuralpay/types";
import { cn } from "@neuralpay/ui/lib/utils";

const TOPICS: {
  value: ChatTopicType | "all";
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "all", label: "All", icon: <MessageSquare className="size-3" /> },
  { value: "budgeting", label: "Budget", icon: <Wallet className="size-3" /> },
  {
    value: "spending",
    label: "Spend",
    icon: <TrendingUp className="size-3" />,
  },
  { value: "savings", label: "Save", icon: <PiggyBank className="size-3" /> },
  { value: "general", label: "General", icon: <Sparkles className="size-3" /> },
];

interface ChatSidebarFiltersProps {
  selectedTopic: string;
  onTopicChange: (topic: ChatTopicType | "") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ChatSidebarFilters({
  selectedTopic,
  onTopicChange,
  onClearFilters,
  hasActiveFilters,
}: ChatSidebarFiltersProps) {
  return (
    <div className="px-3 py-2 border-b">
      <div className="flex items-center gap-1">
        <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
          {TOPICS.map(({ value, label, icon }) => {
            const isActive =
              selectedTopic === value || (value === "all" && !selectedTopic);
            return (
              <Button
                key={value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-[11px] px-2.5 gap-1.5 shrink-0 font-medium",
                  isActive
                    ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:bg-blue-500/20 dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                onClick={() => onTopicChange(value === "all" ? "" : value)}
              >
                {icon}
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClearFilters}
            title="Clear filters"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
