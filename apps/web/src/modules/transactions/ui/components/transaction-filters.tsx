"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@neuralpay/ui/lib/utils";
import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { Badge } from "@neuralpay/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@neuralpay/ui/components/sheet";
import { Switch } from "@neuralpay/ui/components/switch";
import { Label } from "@neuralpay/ui/components/label";
import { Separator } from "@neuralpay/ui/components/separator";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Tag,
  AlertTriangle,
  CreditCard,
  Banknote,
} from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import type { DateRange } from "react-day-picker";
import type { Route } from "next";
import { TRANSACTION_STATUS_LABELS } from "@/modules/transactions/constants";
import { CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { ScrollArea } from "@neuralpay/ui/components/scroll-area";

interface Props {
  currentSearch: string;
  currentType: string;
  currentStatuses: string[];
  currentAccountType: string;
  currentAccountId: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentCategories: string[];
  currentIsManual: boolean;
  currentIsAnomaly: boolean;
  currentAmountMin: string;
  currentAmountMax: string;
}

const DEFAULTS = {
  search: "",
  type: "all",
  statuses: "",
  accountType: "all",
  accountId: "",
  dateFrom: "",
  dateTo: "",
  categories: "",
  isManual: "false",
  isAnomaly: "false",
  amountMin: "",
  amountMax: "",
  page: "1",
};

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking", icon: Banknote },
  { value: "savings", label: "Savings", icon: Banknote },
  { value: "credit", label: "Credit", icon: CreditCard },
  { value: "investment", label: "Investment", icon: CreditCard },
  { value: "crypto", label: "Crypto", icon: CreditCard },
] as const;

const TRANSACTION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" },
] as const;

export function TransactionFilters({
  currentSearch,
  currentType,
  currentStatuses,
  currentAccountType,
  currentAccountId,
  currentDateFrom,
  currentDateTo,
  currentCategories,
  currentIsManual,
  currentIsAnomaly,
  currentAmountMin,
  currentAmountMax,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Local draft state for more filters drawer
  const [draftCategories, setDraftCategories] =
    useState<string[]>(currentCategories);
  const [draftStatuses, setDraftStatuses] = useState<string[]>(currentStatuses);
  const [draftType, setDraftType] = useState(currentType);
  const [draftIsManual, setDraftIsManual] = useState(currentIsManual);
  const [draftIsAnomaly, setDraftIsAnomaly] = useState(currentIsAnomaly);
  const [draftAmountMin, setDraftAmountMin] = useState(currentAmountMin);
  const [draftAmountMax, setDraftAmountMax] = useState(currentAmountMax);

  const updateFilter = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];

      const stringValue = Array.isArray(value) ? value.join(",") : value;

      if (
        stringValue === defaultValue ||
        stringValue.trim() === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else {
        params.set(key, stringValue);
      }

      params.delete("page");

      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  const handleDateChange = useCallback(
    (range: DateRange | undefined) => {
      if (range?.from) {
        updateFilter("dateFrom", range.from.toISOString());
      } else {
        updateFilter("dateFrom", "");
      }
      if (range?.to) {
        updateFilter("dateTo", range.to.toISOString());
      } else {
        updateFilter("dateTo", "");
      }
    },
    [updateFilter],
  );

  const handleApplyMoreFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const set = (key: string, val: string) => {
      const def = DEFAULTS[key as keyof typeof DEFAULTS];
      val && val !== def ? params.set(key, val) : params.delete(key);
    };

    set("categories", draftCategories.join(","));
    set("statuses", draftStatuses.join(","));
    set("type", draftType === "all" ? "" : draftType);
    set("isManual", draftIsManual ? "true" : "");
    set("isAnomaly", draftIsAnomaly ? "true" : "");
    set("amountMin", draftAmountMin);
    set("amountMax", draftAmountMax);

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
    setMoreFiltersOpen(false);
  }, [
    searchParams,
    pathname,
    router,
    draftCategories,
    draftStatuses,
    draftType,
    draftIsManual,
    draftIsAnomaly,
    draftAmountMin,
    draftAmountMax,
  ]);

  const handleClearMoreFilters = useCallback(() => {
    setDraftCategories([]);
    setDraftStatuses([]);
    setDraftType("all");
    setDraftIsManual(false);
    setDraftIsAnomaly(false);
    setDraftAmountMin("");
    setDraftAmountMax("");
    updateFilter("categories", "");
    updateFilter("statuses", "");
    updateFilter("type", "");
    updateFilter("isManual", "");
    updateFilter("isAnomaly", "");
    updateFilter("amountMin", "");
    updateFilter("amountMax", "");
  }, [updateFilter]);

  // Active filter count
  const activeFilterCount = [
    currentType !== "all",
    currentStatuses.length > 0,
    currentAccountType !== "all",
    currentAccountId !== "",
    currentDateFrom !== "",
    currentDateTo !== "",
    currentCategories.length > 0,
    currentIsManual,
    currentIsAnomaly,
    currentAmountMin !== "",
    currentAmountMax !== "",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const dateRange: DateRange | undefined =
    currentDateFrom && currentDateTo
      ? { from: new Date(currentDateFrom), to: new Date(currentDateTo) }
      : undefined;

  const toggleCategory = (cat: string) => {
    setDraftCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleStatus = (status: string) => {
    setDraftStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={currentSearch}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-8 text-sm"
          />
          {currentSearch && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="size-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Select
          value={currentAccountType}
          onValueChange={(v) => updateFilter("accountType", v)}
        >
          <SelectTrigger
            className={cn(
              "w-[140px] h-8 text-sm",
              currentAccountType !== "all" &&
                "bg-primary text-primary-foreground border-primary",
            )}
          >
            <SelectValue placeholder="Account Type" />
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

        <Select
          value={currentType}
          onValueChange={(v) => updateFilter("type", v)}
        >
          <SelectTrigger
            className={cn(
              "w-[120px] h-8 text-sm",
              currentType !== "all" &&
                "bg-primary text-primary-foreground border-primary",
            )}
          >
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={handleDateChange}
          placeholder="Date Range"
        />

        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setMoreFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-5 px-1 text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => {
              const params = new URLSearchParams();
              const query = params.toString();
              router.push((query ? `${pathname}?${query}` : pathname) as Route);
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {currentType !== "all" && (
            <FilterChip
              label={`Type: ${currentType}`}
              onRemove={() => updateFilter("type", "all")}
            />
          )}
          {currentStatuses.map((status) => (
            <FilterChip
              key={status}
              label={TRANSACTION_STATUS_LABELS[status] ?? status}
              onRemove={() => {
                const next = currentStatuses.filter((s) => s !== status);
                updateFilter("statuses", next);
              }}
            />
          ))}
          {currentAccountType !== "all" && (
            <FilterChip
              label={`Account: ${currentAccountType}`}
              onRemove={() => updateFilter("accountType", "all")}
            />
          )}
          {currentCategories.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              onRemove={() => {
                const next = currentCategories.filter((c) => c !== cat);
                updateFilter("categories", next);
              }}
            />
          ))}
          {currentIsManual && (
            <FilterChip
              label="Manual Only"
              onRemove={() => updateFilter("isManual", "false")}
            />
          )}
          {currentIsAnomaly && (
            <FilterChip
              label="Anomalies"
              onRemove={() => updateFilter("isAnomaly", "false")}
              variant="destructive"
            />
          )}
          {currentAmountMin && (
            <FilterChip
              label={`Min: $${currentAmountMin}`}
              onRemove={() => updateFilter("amountMin", "")}
            />
          )}
          {currentAmountMax && (
            <FilterChip
              label={`Max: $${currentAmountMax}`}
              onRemove={() => updateFilter("amountMax", "")}
            />
          )}
        </div>
      )}

      {/* More Filters Drawer */}
      <Sheet open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-4">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="size-5" />
              More Filters
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Categories</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                      draftCategories.includes(key)
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Status</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TRANSACTION_STATUS_LABELS).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleStatus(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                        draftStatuses.includes(key)
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground hover:bg-accent/80",
                      )}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Transaction Type</h3>
              <div className="flex gap-2">
                {TRANSACTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDraftType(type.value)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                      draftType === type.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="manual-toggle"
                    className="text-sm font-medium"
                  >
                    Manual Transactions Only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hide synced transactions from Plaid/Mono
                  </p>
                </div>
                <Switch
                  id="manual-toggle"
                  checked={draftIsManual}
                  onCheckedChange={setDraftIsManual}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="anomaly-toggle"
                    className="text-sm font-medium"
                  >
                    Anomalies Only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show only AI-flagged transactions
                  </p>
                </div>
                <Switch
                  id="anomaly-toggle"
                  checked={draftIsAnomaly}
                  onCheckedChange={setDraftIsAnomaly}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Amount Range</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    placeholder="Min"
                    type="number"
                    value={draftAmountMin}
                    onChange={(e) => setDraftAmountMin(e.target.value)}
                    className="pl-6 h-8 text-sm"
                  />
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={draftAmountMax}
                    onChange={(e) => setDraftAmountMax(e.target.value)}
                    className="pl-6 h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-col gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearMoreFilters}
            >
              Clear All Filters
            </Button>
            <Button className="w-full" onClick={handleApplyMoreFilters}>
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
        className="ml-0.5 rounded-full hover:bg-background/20 p-0.5"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
