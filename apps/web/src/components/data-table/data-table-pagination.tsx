"use client";

import { Button } from "@neuralpay/ui/components/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalRows: number;
}

export function DataTablePagination({
  currentPage,
  pageCount,
  onPageChange,
  pageSize,
  totalRows,
}: DataTablePaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t">
      <div className="text-xs text-muted-foreground">
        Showing {start}–{end} of {totalRows}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
        >
          <ChevronsLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        <span className="text-xs font-medium px-2">
          Page {currentPage} of {pageCount}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage >= pageCount}
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
