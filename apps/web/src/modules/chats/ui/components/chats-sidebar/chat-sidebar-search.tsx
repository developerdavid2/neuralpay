import { Search, X } from "lucide-react";
import { Input } from "@neuralpay/ui/components/input";
import { Button } from "@neuralpay/ui/components/button";

interface ChatSidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ChatSidebarSearch({
  value,
  onChange,
  placeholder = "Search...",
}: ChatSidebarSearchProps) {
  return (
    <div className="relative p-3 pb-2">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 pr-8 text-xs"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 size-6"
          onClick={() => onChange("")}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}
