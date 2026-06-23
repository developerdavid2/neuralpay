"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { useTransactionFilters } from "@/modules/transactions/hooks/use-transaction-filters";
import { CATEGORY_LABELS } from "@/modules/dashboard/constants";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/modules/transactions/constants";
import { Badge } from "@neuralpay/ui/components/badge";
import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Separator } from "@neuralpay/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@neuralpay/ui/components/sheet";
import { Switch } from "@neuralpay/ui/components/switch";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  DollarSign,
  Filter,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking", icon: Banknote },
  { value: "savings", label: "Savings", icon: Banknote },
  { value: "credit", label: "Credit", icon: CreditCard },
  { value: "investment", label: "Investment", icon: CreditCard },
  { value: "crypto", label: "Crypto", icon: CreditCard },
] as const;

export function TransactionFilters() {
  const {
    currentSearch,
    currentTypes,
    currentStatuses,
    currentAccountType,
    currentCategories,
    currentIsManual,
    currentIsAnomaly,
    currentAmountMin,
    currentAmountMax,
    draftCategories,
    draftStatuses,
    draftTransactionTypes,
    draftIsManual,
    draftIsAnomaly,
    draftAmountMin,
    draftAmountMax,
    moreFiltersOpen,
    updateSearch,
    updateStatuses,
    updateCategories,
    openDrawer,
    closeDrawer,
    toggleDraftTransactionType,
    toggleDraftCategory,
    toggleDraftStatus,
    setDraftTransactionTypes,
    setDraftCategories,
    setDraftStatuses,
    toggleDraftManual,
    toggleDraftAnomaly,
    updateDraftMinAmount,
    updateDraftMaxAmount,
    applyDrawerFilters,
    resetDrawer,
    activeFilterCount,
    hasActiveFilters,
    dateRange,
    updateAccountType,
    updateTransactionTypes,
    updateDateRange,
    updateIsManual,
    updateIsAnomaly,
    updateAmountMin,
    updateAmountMax,
  } = useTransactionFilters();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={updateSearch}
          placeholder="Search transactions..."
          className="flex-1 max-w-sm"
        />

        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 shrink-0"
          onClick={openDrawer}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant={hasActiveFilters ? "secondary" : "secondary"}
              className="ml-1 h-5 min-w-5 px-1 text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 min-h-5">
        {currentTypes.map((type) => (
          <FilterChip
            key={type}
            label={TRANSACTION_TYPE_LABELS[type] ?? type}
            onRemove={() =>
              updateTransactionTypes(currentTypes.filter((t) => t !== type))
            }
          />
        ))}
        {currentAccountType !== "all" && (
          <FilterChip
            label={`Account: ${currentAccountType}`}
            onRemove={() => {
              const params = new URLSearchParams(window.location.search);
              params.delete("accountType");
              params.delete("page");
              window.history.pushState({}, "", `?${params.toString()}`);
            }}
          />
        )}
        {dateRange?.from && (
          <FilterChip
            label={
              dateRange.to
                ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
                : dateRange.from.toLocaleDateString()
            }
            onRemove={() => updateDateRange(undefined)}
          />
        )}
        {currentStatuses.map((status) => (
          <FilterChip
            key={status}
            label={TRANSACTION_STATUS_LABELS[status] ?? status}
            onRemove={() =>
              updateStatuses(currentStatuses.filter((s) => s !== status))
            }
          />
        ))}
        {currentCategories.map((cat) => (
          <FilterChip
            key={cat}
            label={CATEGORY_LABELS[cat] ?? cat}
            onRemove={() =>
              updateCategories(currentCategories.filter((c) => c !== cat))
            }
          />
        ))}
        {currentIsManual && (
          <FilterChip
            label="Manual Only"
            onRemove={() => updateIsManual(false)}
          />
        )}

        {currentIsAnomaly && (
          <FilterChip
            label="Anomalies Only"
            variant="destructive"
            onRemove={() => updateIsAnomaly(false)}
          />
        )}

        {currentAmountMin && (
          <FilterChip
            label={`Min: $${currentAmountMin}`}
            onRemove={() => updateAmountMin("")}
          />
        )}

        {currentAmountMax && (
          <FilterChip
            label={`Max: $${currentAmountMax}`}
            onRemove={() => updateAmountMax("")}
          />
        )}
      </div>

      {/* ── Filter Sheet ── */}
      <Sheet
        open={moreFiltersOpen}
        onOpenChange={(open) => !open && closeDrawer()}
      >
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 ">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Filter className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {activeFilterCount} active
                  </Badge>
                )}
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
            {/* Account Type */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Account Type</h3>
              <Select
                value={currentAccountType}
                onValueChange={updateAccountType}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="size-3.5" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Date Range</h3>
              <DateRangePicker
                value={dateRange}
                onChange={updateDateRange}
                placeholder="Pick a date range"
                className="w-full"
              />
            </div>

            <Separator />

            {/* Transaction Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Transaction types</h3>
                </div>
                <button
                  onClick={() => {
                    const all = Object.keys(TRANSACTION_TYPE_LABELS);
                    setDraftTransactionTypes(
                      draftTransactionTypes.length === all.length ? [] : all,
                    );
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {draftTransactionTypes.length ===
                  Object.keys(TRANSACTION_TYPE_LABELS).length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TRANSACTION_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDraftTransactionType(key)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                      draftTransactionTypes.includes(key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-3.5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Status</h3>
                </div>
                <button
                  onClick={() => {
                    const all = Object.keys(TRANSACTION_STATUS_LABELS);
                    setDraftStatuses(
                      draftStatuses.length === all.length ? [] : all,
                    );
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {draftStatuses.length ===
                  Object.keys(TRANSACTION_STATUS_LABELS).length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TRANSACTION_STATUS_LABELS).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleDraftStatus(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                        draftStatuses.includes(key)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-accent",
                      )}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="size-3.5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Categories</h3>
                </div>
                <button
                  onClick={() => {
                    const all = Object.keys(CATEGORY_LABELS);
                    setDraftCategories(
                      draftCategories.length === all.length ? [] : all,
                    );
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {draftCategories.length ===
                  Object.keys(CATEGORY_LABELS).length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDraftCategory(key)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                      draftCategories.includes(key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Manual / Anomaly toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Manual Only</p>
                  <p className="text-xs text-muted-foreground">
                    Hide synced transactions from Plaid / Mono
                  </p>
                </div>
                <Switch
                  checked={draftIsManual}
                  onCheckedChange={toggleDraftManual}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Anomalies Only</p>
                  <p className="text-xs text-muted-foreground">
                    Show only AI-flagged transactions
                  </p>
                </div>
                <Switch
                  checked={draftIsAnomaly}
                  onCheckedChange={toggleDraftAnomaly}
                />
              </div>
            </div>

            <Separator />

            {/* Amount Range */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Amount Range</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={draftAmountMin}
                    onChange={(e) => updateDraftMinAmount(e.target.value)}
                    className="pl-6 h-8 text-sm w-full rounded-md border border-input bg-background px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <span className="text-muted-foreground text-sm">–</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={draftAmountMax}
                    onChange={(e) => updateDraftMaxAmount(e.target.value)}
                    className="pl-6 h-8 text-sm w-full rounded-md border border-input bg-background px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer — one Clear All + one Apply */}
          <SheetFooter className="flex-col gap-2 px-4 py-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={resetDrawer}>
              Clear All Filters
            </Button>
            <Button className="w-full" onClick={applyDrawerFilters}>
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
  variant = "default",
}: {
  label: string;
  onRemove: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <Badge
      variant={variant === "destructive" ? "destructive" : "secondary"}
      className="gap-1 pr-1.5 text-[11px] font-medium"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-background/20 p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
