"use client";

import { Button } from "@neuralpay/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDataTableNavigation } from "@/hooks/use-data-table-navigation";
import { cn } from "@neuralpay/ui/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  showPageSelect?: boolean;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  pageCount,
  pageSize,
  totalRows,
  showPageSelect = false,
  className,
}: DataTablePaginationProps) {
  const { setPage } = useDataTableNavigation();

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);

  const canGoFirst = currentPage > 1;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < pageCount;
  const canGoLast = currentPage < pageCount;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = pageCount - 3; i <= pageCount; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(pageCount);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t gap-4",
        className,
      )}
    >
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        Showing <span className="text-foreground font-medium">{start}</span> -{" "}
        <span className="text-foreground font-medium">{end}</span> of{" "}
        <span className="text-foreground font-medium">{totalRows}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => setPage(1)}
          disabled={!canGoFirst}
        >
          <ChevronFirst className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => setPage(currentPage - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {showPageSelect ? (
          <Select
            value={String(currentPage)}
            onValueChange={(v) => setPage(Number(v))}
          >
            <SelectTrigger className="h-7 w-[100px] text-xs mx-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <SelectItem key={p} value={String(p)} className="text-xs">
                  Page {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-0.5 mx-1">
            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="size-7 flex items-center justify-center text-xs text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "size-7 rounded-full text-xs",
                    currentPage === page &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                  onClick={() => setPage(page)}
                >
                  {page}
                </Button>
              ),
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => setPage(currentPage + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => setPage(pageCount)}
          disabled={!canGoLast}
        >
          <ChevronLast className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
