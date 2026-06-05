"use client";

import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { useAccountFilters } from "@/hooks/accounts/use-account-filters";

import { Badge } from "@neuralpay/ui/components/badge";
import { Button } from "@neuralpay/ui/components/button";
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
import { Filter, SlidersHorizontal, Tag, AlertTriangle, X } from "lucide-react";
import { ACCOUNT_STATUS_CONFIG, ACCOUNT_TYPE_CONFIG } from "../../constants";

export function AccountFilters() {
  const {
    currentSearch,
    currentTypes,
    currentStatuses,
    currentIsManual,
    draftTypes,
    draftStatuses,
    draftIsManual,
    moreFiltersOpen,
    updateSearch,
    openDrawer,
    closeDrawer,
    toggleDraftType,
    toggleDraftStatus,
    setDraftTypes,
    setDraftStatuses,
    toggleDraftManual,
    applyDrawerFilters,
    resetDrawer,
    activeFilterCount,
    hasActiveFilters,
    updateTypes,
    updateStatuses,
    updateIsManual,
  } = useAccountFilters();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DebouncedSearchInput
          value={currentSearch}
          onSearch={updateSearch}
          placeholder="Search accounts..."
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
              variant="secondary"
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
            label={ACCOUNT_TYPE_CONFIG[type]?.label ?? type}
            onRemove={() => updateTypes(currentTypes.filter((t) => t !== type))}
          />
        ))}
        {currentStatuses.map((status) => (
          <FilterChip
            key={status}
            label={ACCOUNT_STATUS_CONFIG[status]?.label ?? status}
            onRemove={() =>
              updateStatuses(currentStatuses.filter((s) => s !== status))
            }
          />
        ))}
        {currentIsManual && (
          <FilterChip
            label="Manual Only"
            onRemove={() => updateIsManual(false)}
          />
        )}
      </div>

      <Sheet
        open={moreFiltersOpen}
        onOpenChange={(open) => !open && closeDrawer()}
      >
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {activeFilterCount} active
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
            {/* Account Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="size-3.5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Account Types</h3>
                </div>
                <button
                  onClick={() => {
                    const all = Object.keys(ACCOUNT_TYPE_CONFIG);
                    setDraftTypes(draftTypes.length === all.length ? [] : all);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {draftTypes.length === Object.keys(ACCOUNT_TYPE_CONFIG).length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => toggleDraftType(key)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                      draftTypes.includes(key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent",
                    )}
                  >
                    {config.label}
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
                    const all = Object.keys(ACCOUNT_STATUS_CONFIG);
                    setDraftStatuses(
                      draftStatuses.length === all.length ? [] : all,
                    );
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {draftStatuses.length ===
                  Object.keys(ACCOUNT_STATUS_CONFIG).length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ACCOUNT_STATUS_CONFIG).map(([key, config]) => (
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
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Manual toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Manual Only</p>
                <p className="text-xs text-muted-foreground">
                  Hide synced accounts from Plaid / Mono
                </p>
              </div>
              <Switch
                checked={draftIsManual}
                onCheckedChange={toggleDraftManual}
              />
            </div>
          </div>

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
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1.5 text-[11px] font-medium">
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
