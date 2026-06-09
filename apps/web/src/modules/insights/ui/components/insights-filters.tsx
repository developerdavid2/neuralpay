"use client";

import { cn } from "@neuralpay/ui/lib/utils";
import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Filter, Archive } from "lucide-react";
import { INSIGHTS_TYPE_LABELS } from "../../constants";
import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { useInsightFilters } from "@/modules/insights/hooks/use-insight-filters";

export function InsightsFilters() {
  const {
    currentSearch,
    currentType,
    currentSeverity,
    currentShowDismissed,
    currentReadStatus,
    updateFilter,
    hasActiveFilters,
    handleClearAll,
  } = useInsightFilters();

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={(value) => updateFilter("search", value)}
          placeholder="Search insights..."
          debounceMs={400}
        />
        <Button
          variant={currentShowDismissed ? "default" : "outline"}
          size="sm"
          onClick={() =>
            updateFilter("dismissed", currentShowDismissed ? "false" : "true")
          }
        >
          <Archive className="size-4 mr-2" />
          {currentShowDismissed ? "Hide dismissed" : "Show dismissed"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />

        <Select
          value={currentType}
          onValueChange={(v) => updateFilter("type", v)}
        >
          <SelectTrigger
            className={cn(
              "w-35 h-8 text-sm",
              currentType !== "all" && "bg-primary text-white",
            )}
          >
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(INSIGHTS_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentSeverity}
          onValueChange={(v) => updateFilter("severity", v)}
        >
          <SelectTrigger
            className={cn(
              "w-35 h-8 text-sm",
              currentSeverity !== "all" && "bg-primary text-white",
            )}
          >
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentReadStatus}
          onValueChange={(v) => updateFilter("readStatus", v)}
        >
          <SelectTrigger
            className={cn(
              "w-40 h-8 text-sm",
              currentReadStatus !== "all" && "bg-primary text-white",
            )}
          >
            <SelectValue placeholder="Read Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All read status</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
