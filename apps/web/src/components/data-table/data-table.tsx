// components/data-table/data-table.tsx
"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@neuralpay/ui/components/table";
import { cn } from "@neuralpay/ui/lib/utils";
import { useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

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
  hideToolbar?: boolean;
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
  hideToolbar = false,
  headerClassName,
  noScroll = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
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
    onColumnVisibilityChange: setColumnVisibility,
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
      columnVisibility,
      rowSelection,
      pagination:
        pagination === "paged"
          ? { pageIndex: currentPage - 1, pageSize }
          : undefined,
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

  // The table itself — no wrapper, just like your original working code
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
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          columnNames={columnNames}
          selectedCount={actualSelectedCount}
          deletableCount={actualDeletableCount}
          onClearSelection={onClearSelection}
          onBatchDelete={onBatchDelete}
          showPagination={pagination === "paged"}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
          pageCount={pageCount}
        />
      )}

      {/* KEY FIX: no wrapper div when noScroll — table is direct child of parent's scroll container */}
      {noScroll ? (
        tableNode
      ) : (
        <div className="flex-1 overflow-auto">{tableNode}</div>
      )}

      {pagination === "paged" && onPageChange && (
        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount ?? 1}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalRows={data.length}
        />
      )}
    </div>
  );
}
