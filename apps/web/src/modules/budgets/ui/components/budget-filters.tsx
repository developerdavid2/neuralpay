"use client";

import { DebouncedSearchInput } from "@/components/debounced-search-input";

interface BudgetFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const limitOptions = [10, 20, 50];

export function BudgetFilters({ search, onSearchChange }: BudgetFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DebouncedSearchInput
          value={search}
          onSearch={onSearchChange}
          placeholder="Search budgets..."
          className="max-w-xl"
        />
      </div>
    </div>
  );
}
