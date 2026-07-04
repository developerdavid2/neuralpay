"use client";

import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import type { NotificationCategory } from "@neuralpay/types";
import { Filter } from "lucide-react";

interface NotificationFiltersProps {
  currentSearch: string;
  currentCategory: NotificationCategory | "all";
  currentStatus: "all" | "read" | "unread";
  currentLimit: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: NotificationCategory | "all") => void;
  onStatusChange: (value: "all" | "read" | "unread") => void;
  onLimitChange: (value: number) => void;
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

const statusOptions: Array<{
  value: "all" | "read" | "unread";
  label: string;
}> = [
  { value: "all", label: "All status" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const limitOptions = [10, 20, 30, 50];

export function NotificationFilters({
  currentSearch,
  currentCategory,
  currentStatus,
  currentLimit,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onLimitChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={onSearchChange}
          placeholder="Search notifications..."
          className="max-w-xl"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={currentCategory}
          onValueChange={(value) =>
            onCategoryChange(value as NotificationCategory | "all")
          }
        >
          <SelectTrigger className="w-42.5 h-9">
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

        <Select
          value={currentStatus}
          onValueChange={(value) =>
            onStatusChange(value as "all" | "read" | "unread")
          }
        >
          <SelectTrigger className="w-35 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentLimit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="w-30 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => {
            onSearchChange("");
            onCategoryChange("all");
            onStatusChange("all");
            onLimitChange(20);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
