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
import { Settings2, Trash2 } from "lucide-react";

interface Props {
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  selectedCount: number;
  deletableCount: number;
  onClearSelection: () => void;
  onBatchDelete: () => void;
}

const COLUMN_NAMES = [
  "date",
  "merchant",
  "category",
  "amount",
  "status",
] as const;

export function TransactionToolbar({
  columnVisibility,
  onColumnVisibilityChange,
  selectedCount,
  deletableCount,
  onClearSelection,
  onBatchDelete,
}: Props) {
  const { currentValue: limitValue, setValue: setLimit } =
    useQueryParam("limit");

  const currentLimit = limitValue ? Number(limitValue) : 20;

  return (
    <div className="sticky top-0 z-30 mx-6 py-2 flex items-center justify-between gap-4 border-t">
      <div className="flex items-center gap-2">
        <Select value={String(currentLimit)} onValueChange={(v) => setLimit(v)}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["10", "20", "50"].map((n) => (
              <SelectItem key={n} value={n} className="text-xs">
                {n} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <Settings2 className="size-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {COLUMN_NAMES.map((col) => (
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          {deletableCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({deletableCount} deletable)
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
          {deletableCount > 0 && (
            <Button variant="destructive" size="sm" onClick={onBatchDelete}>
              <Trash2 className="size-3.5 mr-1" />
              Delete {deletableCount}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
