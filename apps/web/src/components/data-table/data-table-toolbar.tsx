"use client";

import { useQueryParam } from "@/hooks/use-query-param";
import { Button } from "@neuralpay/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { cn } from "@neuralpay/ui/lib/utils";
import { Loader2, Settings2, Trash2 } from "lucide-react";

interface DataTableToolbarProps {
  // Column visibility — pass from parent's state
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  columnNames?: readonly string[];

  // Selection
  selectedCount?: number;
  deletableCount?: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  isBatchDeleting?: boolean;

  showLimitSelector?: boolean;
  limitParamKey?: string;
  limitOptions?: string[];

  onPageChange?: (page: number) => void;

  className?: string;
}

export function DataTableToolbar({
  columnVisibility,
  onColumnVisibilityChange,
  columnNames,
  selectedCount = 0,
  deletableCount = 0,
  onClearSelection,
  onBatchDelete,
  isBatchDeleting = false,
  showLimitSelector = false,
  limitParamKey = "limit",
  limitOptions = ["10", "20", "50"],
  onPageChange,
  className,
}: DataTableToolbarProps) {
  const { currentValue: limitValue, setValue: setLimit } =
    useQueryParam(limitParamKey);
  const currentLimit = limitValue ? Number(limitValue) : 20;

  return (
    <div className={cn("flex flex-row", className)}>
      <div className="flex items-center gap-2">
        {showLimitSelector && (
          <Select
            value={String(currentLimit)}
            onValueChange={(v) => {
              setLimit(v);
              onPageChange?.(1);
            }}
          >
            <SelectTrigger className="h-7 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((n) => (
                <SelectItem key={n} value={n} className="text-xs">
                  {n} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <Settings2 className="size-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columnNames?.map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={columnVisibility[col] !== false}
                onCheckedChange={(val) =>
                  onColumnVisibilityChange({ ...columnVisibility, [col]: val })
                }
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-1 items-center justify-between pl-6">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>
            {deletableCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({deletableCount} deletable)
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
            {deletableCount > 0 && onBatchDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBatchDelete}
                disabled={isBatchDeleting}
              >
                {isBatchDeleting ? (
                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5 mr-1" />
                )}
                {isBatchDeleting ? "Deleting..." : `Delete ${deletableCount}`}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
