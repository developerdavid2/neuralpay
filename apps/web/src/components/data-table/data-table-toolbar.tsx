"use client";

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
import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  columnNames?: readonly string[];
  selectedCount: number;
  deletableCount: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  showPagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageCount?: number;
}

export function DataTableToolbar<TData>({
  table,
  columnNames,
  selectedCount,
  deletableCount,
  onClearSelection,
  onBatchDelete,
  showPagination,
  pageSize = 20,
  currentPage = 1,
  onPageChange,
  pageCount,
}: DataTableToolbarProps<TData>) {
  const cols =
    columnNames ??
    table
      .getAllColumns()
      .filter((c) => c.getCanHide() && c.id !== "actions" && c.id !== "select")
      .map((c) => c.id);

  return (
    <div className="sticky top-0 z-30 py-2 flex items-center justify-between gap-4 border-t">
      <div className="flex items-center gap-2">
        {showPagination && onPageChange && (
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageChange(1);
            }}
          >
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
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <Settings2 className="size-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {cols.map((col) => {
              const column = table.getColumn(col);
              if (!column) return null;
              return (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={column.getIsVisible()}
                  onCheckedChange={(val) => column.toggleVisibility(!!val)}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </DropdownMenuCheckboxItem>
              );
            })}
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
          {deletableCount > 0 && onBatchDelete && (
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
