import {
  CHAT_CONTEXT_TYPES,
  CHAT_TOPIC_TYPES,
} from "@/modules/chats/constants";
import type { ChatContextType, ChatTopicType } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { cn } from "@neuralpay/ui/lib/utils";
import { Archive, Filter, X } from "lucide-react";

interface ChatSidebarFiltersProps {
  selectedTopic: ChatTopicType | "";
  selectedContextType: ChatContextType | "";
  onTopicChange: (topic: ChatTopicType | "") => void;
  onContextTypeChange: (contextType: ChatContextType | "") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  archivedCount?: number;
  onOpenArchive: () => void;
}

export function ChatSidebarFilters({
  selectedTopic,
  selectedContextType,
  onTopicChange,
  onContextTypeChange,
  onClearFilters,
  hasActiveFilters,
  archivedCount,
  onOpenArchive,
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
              <SelectItem key={topic.value} value={topic.value}>
                {topic.label}
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
              <SelectItem key={ctx.value} value={ctx.value}>
                {ctx.label}
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

      {archivedCount !== undefined && archivedCount > 0 && (
        <button
          onClick={onOpenArchive}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <Archive className="size-3.5" />
          <span className="flex-1 text-left">Archived</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
            {archivedCount}
          </span>
        </button>
      )}
    </div>
  );
}
