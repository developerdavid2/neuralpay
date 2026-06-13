import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Button } from "@neuralpay/ui/components/button";
import { Filter, X } from "lucide-react";
import { cn } from "@neuralpay/ui/lib/utils";
import type { ChatTopicType, ChatContextType } from "@neuralpay/types";
import { CHAT_CONTEXT_TYPES, CHAT_TOPIC_TYPES } from "@neuralpay/types";

const TOPIC_LABELS: Record<ChatTopicType, string> = {
  budgeting: "Budgeting",
  spending: "Spending",
  savings: "Savings",
  general: "General",
};

const CONTEXT_LABELS: Record<ChatContextType, string> = {
  insight: "Insight",
  transaction: "Transaction",
  budget: "Budget",
  vault: "Vault",
  split: "Split",
  general: "General",
};

interface ChatSidebarFiltersProps {
  selectedTopic: ChatTopicType | "";
  selectedContextType: ChatContextType | "";
  onTopicChange: (topic: ChatTopicType | "") => void;
  onContextTypeChange: (contextType: ChatContextType | "") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ChatSidebarFilters({
  selectedTopic,
  selectedContextType,
  onTopicChange,
  onContextTypeChange,
  onClearFilters,
  hasActiveFilters,
}: ChatSidebarFiltersProps) {
  return (
    <div className="px-3 py-2 border-b space-y-2">
      <div className="flex items-center gap-1.5">
        <Filter className="size-3 text-muted-foreground shrink-0" />

        <Select
          value={selectedTopic || "all"}
          onValueChange={(v) =>
            onTopicChange(v === "all" ? "" : (v as ChatTopicType))
          }
        >
          <SelectTrigger
            className={cn(
              "flex-1 h-7 text-xs",
              selectedTopic &&
                "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
            )}
          >
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {CHAT_TOPIC_TYPES.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {TOPIC_LABELS[topic]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedContextType || "all"}
          onValueChange={(v) =>
            onContextTypeChange(v === "all" ? "" : (v as ChatContextType))
          }
        >
          <SelectTrigger
            className={cn(
              "flex-1 h-7 text-xs",
              selectedContextType &&
                "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
            )}
          >
            <SelectValue placeholder="Context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All contexts</SelectItem>
            {CHAT_CONTEXT_TYPES.map((ctx) => (
              <SelectItem key={ctx} value={ctx}>
                {CONTEXT_LABELS[ctx]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClearFilters}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
