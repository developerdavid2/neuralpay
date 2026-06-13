import { PremiumButton } from "@/components/premium-button";
import { Loader2, MessageSquare, Plus } from "lucide-react";

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  isCreating: boolean;
}

export function ChatSidebarHeader({
  onNewChat,
  isCreating,
}: ChatSidebarHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 border-b px-4 py-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MessageSquare className="size-4 shrink-0 text-primary" />
        <h2 className="text-md font-semibold truncate">Conversations</h2>
      </div>
      <PremiumButton
        onClick={onNewChat}
        disabled={isCreating}
        className="shrink-0 gap-1.5 flex"
        icon={isCreating ? Loader2 : Plus}
      >
        <span className="hidden sm:inline">New</span>
      </PremiumButton>
    </div>
  );
}
