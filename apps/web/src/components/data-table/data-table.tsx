// components/data-table/data-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@neuralpay/ui/components/table";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: "infinite" | "paged" | "none";
  pageSize?: number;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  selectedCount?: number;
  deletableCount?: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  columnNames?: readonly string[];
  rowIdKey?: keyof TData;
  getRowClassName?: (row: TData) => string;
  emptyState?: React.ReactNode;
  externalRowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (v: Record<string, boolean>) => void;
  headerClassName?: string;
  noScroll?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = "paged",
  pageSize = 20,
  pageCount,
  currentPage = 1,
  onPageChange,
  selectedCount: externalSelectedCount,
  deletableCount: externalDeletableCount,
  onClearSelection,
  onBatchDelete,
  columnNames,
  rowIdKey = "id" as keyof TData,
  getRowClassName,
  emptyState,
  externalRowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  headerClassName,
  noScroll = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColVisibility, setInternalColVisibility] =
    useState<VisibilityState>({});
  const colVisibility = columnVisibility ?? internalColVisibility;
  const [internalRowSelection, setInternalRowSelection] = useState({});

  const isExternalSelection = externalRowSelection !== undefined;
  const rowSelection = isExternalSelection
    ? externalRowSelection
    : internalRowSelection;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      pagination === "paged" ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updater) => {
      if (isExternalSelection && onRowSelectionChange) {
        const newSelection =
          typeof updater === "function" ? updater(rowSelection) : updater;
        onRowSelectionChange(newSelection);
      } else {
        setInternalRowSelection(updater);
      }
    },
    getRowId: (row) => String(row[rowIdKey]),
    state: {
      sorting,
      columnFilters,
      columnVisibility: colVisibility,
      rowSelection,
      pagination:
        pagination === "paged"
          ? { pageIndex: currentPage - 1, pageSize }
          : undefined,
    },
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(colVisibility) : updater;
      if (onColumnVisibilityChange)
        onColumnVisibilityChange(next as Record<string, boolean>);
      else setInternalColVisibility(next);
    },
    manualPagination: pagination === "paged" && !!onPageChange,
    pageCount: pagination === "paged" ? pageCount : undefined,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const actualSelectedCount = externalSelectedCount ?? selectedRows.length;
  const actualDeletableCount =
    externalDeletableCount ??
    selectedRows.filter((r) => (r.original as { isManual?: boolean }).isManual)
      .length;

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const tableNode = (
    <Table noWrapper>
      <TableHeader
        className={cn(
          "sticky z-20 backdrop-blur-xl bg-muted/95",
          headerClassName,
        )}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              if (!header.column.getIsVisible()) return null;
              return (
                <TableHead
                  key={header.id}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={cn(
                row.getIsSelected() && "bg-primary/5",
                getRowClassName?.(row.original),
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col h-full">
      {noScroll ? (
        tableNode
      ) : (
        <div className="flex-1 overflow-auto">{tableNode}</div>
      )}
    </div>
  );
}
