import { formatAmount } from "@/lib/utils";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/modules/dashboard/constants";
import type { Transaction } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronsUpDown,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { isSyncedSource } from "../../lib/utils";
import { SourceBadge, StatusBadge } from "./transaction-badges";

interface ColumnProps {
  onView: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  isRowPending: (id: string) => boolean;
}

export function transactionColumns({
  onView,
  onEdit,
  onDelete,
  isRowPending,
}: ColumnProps): ColumnDef<Transaction>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const tx = row.original;
        const isDisabled = !tx.isManual;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(!!val)}
            disabled={isDisabled}
            title={
              isDisabled
                ? "Synced transactions cannot be batch deleted"
                : undefined
            }
          />
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ChevronsUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(row.original.date), "MMM dd")}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {format(new Date(row.original.date), "HH:mm")}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "merchant",
      header: "Merchant / Description",
      size: 280,
      cell: ({ row }) => {
        const tx = row.original;
        const Icon = CATEGORY_ICONS[tx.category ?? "other"];
        return (
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent">
              <Icon className="size-3.5 text-muted-foreground" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {tx.merchant}
              </span>
              <div className="flex items-center gap-1.5">
                <SourceBadge tx={tx} variant="text" />
                {tx.isAnomaly && (
                  <span className="text-[10px] text-destructive font-medium">
                    Flagged
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ChevronsUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[row.original.category ?? "Other"] ?? "Other"}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "amount",
      sortingFn: (rowA, rowB) => {
        const a =
          rowA.original.type === "credit"
            ? Number(rowA.original.amount)
            : -Number(rowA.original.amount);
        const b =
          rowB.original.type === "credit"
            ? Number(rowB.original.amount)
            : -Number(rowB.original.amount);
        return a - b;
      },
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ChevronsUpDown className="ml-2 size-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const isIncome = row.original.type === "credit";
        return (
          <div
            className={`text-right font-mono text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-600" : ""}`}
          >
            {isIncome ? "+" : "−"}
            {formatAmount(Math.abs(Number(row.original.amount)))}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ChevronsUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 100,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tx = row.original;
        const pending = isRowPending(tx.id);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(tx)} disabled={pending}>
                <Eye className="size-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(tx)}
                disabled={isSyncedSource(tx) || pending}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(tx)}
                disabled={isSyncedSource(tx) || pending}
              >
                <Trash2 className="size-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
