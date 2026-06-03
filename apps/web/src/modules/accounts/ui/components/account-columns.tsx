import { formatAmount } from "@/lib/utils";
import { ACCOUNT_TYPE_LABELS } from "@/modules/accounts/constants";
import { Button } from "@neuralpay/ui/components/button";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ChevronsUpDown,
  Eye,
  Landmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unplug,
} from "lucide-react";
import { AccountStatusBadge, AccountTypeBadge } from "./account-badges";
import type { BankAccount } from "@neuralpay/types";

interface ColumnProps {
  onView: (account: BankAccount) => void;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

export function accountColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<BankAccount>[] {
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
        const account = row.original;
        const isDisabled = !account.isManual;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(!!val)}
            disabled={isDisabled}
            title={
              isDisabled ? "Synced accounts cannot be batch deleted" : undefined
            }
          />
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account
          <ChevronsUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Landmark className="size-4 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {account.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {account.bankName ?? "Manual Account"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ChevronsUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => <AccountTypeBadge type={row.original.type} />,
      size: 120,
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[12px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Balance
            <ChevronsUpDown className="ml-2 size-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const balance = Number(row.original.balance ?? 0);
        const isNegative = balance < 0;
        return (
          <div
            className={`text-right font-mono text-sm font-semibold tabular-nums ${
              isNegative ? "text-destructive" : ""
            }`}
          >
            {isNegative ? "−" : ""}
            {formatAmount(Math.abs(balance))}
          </div>
        );
      },
      size: 140,
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
      cell: ({ row }) => <AccountStatusBadge status={row.original.status} />,
      size: 100,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original;
        const isSynced = !account.isManual;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(account)}>
                <Eye className="size-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Unplug className="size-4 mr-2" /> Disconnect Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(account)}
                disabled={isSynced}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(account)}
                disabled={isSynced}
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
