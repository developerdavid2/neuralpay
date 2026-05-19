"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@neuralpay/ui/lib/utils";
import { Input } from "@neuralpay/ui/components/input";
import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Search, Filter, Archive } from "lucide-react";
import { INSIGHTS_TYPE_LABELS } from "../../constants";
import type { Route } from "next";

interface Props {
  currentSearch: string;
  currentType: string;
  currentSeverity: string;
  currentShowDismissed: boolean;
}

const DEFAULTS = {
  search: "",
  type: "all",
  severity: "all",
  archived: "false",
  page: "1",
};

export function InsightsFilters({
  currentSearch,
  currentType,
  currentSeverity,
  currentShowDismissed,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];

      if (value === defaultValue || value.trim() === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Reset pagination on filter change
      params.delete("page");

      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  const hasActiveFilters =
    currentType !== "all" ||
    currentSeverity !== "all" ||
    currentSearch !== "" ||
    currentShowDismissed;

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search insights..."
            value={currentSearch}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateFilter("archived", currentShowDismissed ? "false" : "true")
          }
          className={cn(currentShowDismissed && "bg-accent")}
        >
          <Archive className="size-4 mr-2" />
          {currentShowDismissed ? "Hide archived" : "Show archived"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select
          value={currentType}
          onValueChange={(v) => updateFilter("type", v)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
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
          <SelectTrigger className="w-[140px] h-8 text-xs">
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              const query = params.toString();
              router.push((query ? `${pathname}?${query}` : pathname) as Route);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
