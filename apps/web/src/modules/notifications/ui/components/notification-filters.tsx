"use client";

import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { Button } from "@neuralpay/ui/components/button";
import { Badge } from "@neuralpay/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { cn } from "@neuralpay/ui/lib/utils";
import type { NotificationCategory } from "@neuralpay/types";
import { Filter } from "lucide-react";

interface NotificationFiltersProps {
  currentSearch: string;
  currentCategory: NotificationCategory | "all";
  currentStatus: "all" | "read" | "unread";
  currentLimit: number;
  unreadCount: number;
  updateFilter: (key: string, value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const categoryOptions: Array<{
  value: NotificationCategory | "all";
  label: string;
}> = [
  { value: "all", label: "All categories" },
  { value: "transaction", label: "Transactions" },
  { value: "budget", label: "Budgets" },
  { value: "account", label: "Accounts" },
  { value: "security", label: "Security" },
  { value: "split", label: "Splits" },
  { value: "vault", label: "Vaults" },
  { value: "ai", label: "AI" },
  { value: "subscription", label: "Subscriptions" },
  { value: "system", label: "System" },
];

const limitOptions = [2, 20, 30, 50];

export function NotificationFilters({
  currentSearch,
  currentCategory,
  currentStatus,
  currentLimit,
  unreadCount,
  updateFilter,
  hasActiveFilters,
  onClearFilters,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={(value) => updateFilter("search", value)}
          placeholder="Search notifications..."
          className="max-w-xl"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={currentCategory}
          onValueChange={(value) => {
            updateFilter("category", value);
          }}
        >
          <SelectTrigger
            className={cn(
              "w-42.5 h-9",
              currentCategory !== "all" && "bg-primary text-primary-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="size-3.5" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status select — shows unread badge when unread is selected */}
        <Select
          value={currentStatus}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger
            className={cn(
              "h-9",
              currentStatus !== "all"
                ? "bg-primary text-primary-foreground w-auto px-3"
                : "w-35",
            )}
          >
            <div className="flex items-center gap-2">
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="unread">
              <div className="flex items-center gap-2">
                Unread
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 px-1 text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(currentLimit)}
          onValueChange={(value) => updateFilter("limit", value)}
        >
          <SelectTrigger className="w-30 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
