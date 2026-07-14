// components/data-table/data-table-toolbar.tsx
"use client";

import { useDataTableNavigation } from "@/hooks/routing/use-data-table-navigation";
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
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import { Settings2, Trash2 } from "lucide-react";

interface DataTableToolbarProps {
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  columnNames?: readonly string[];

  selectedCount?: number;
  deletableCount?: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  isBatchDeleting?: boolean;

  showLimitSelector?: boolean;
  limitOptions?: string[];
  currentLimit?: number;

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
  limitOptions = ["10", "20", "50"],
  currentLimit = 20,
  className,
}: DataTableToolbarProps) {
  const { setLimit } = useDataTableNavigation();

  return (
    <div className={cn("flex flex-row items-center", className)}>
      <div className="flex items-center gap-2">
        {showLimitSelector && (
          <Select
            value={String(currentLimit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="h-7 w-22.5 text-xs">
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
                  <Spinner className="size-3.5 mr-1" />
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
