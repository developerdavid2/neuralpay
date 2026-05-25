import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import type { Transaction } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@neuralpay/ui/components/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, Ban } from "lucide-react";

export function TransactionRowActions({
  transaction,
}: {
  transaction: Transaction;
}) {
  const { openView, openEdit, handleDelete, isDeleting } =
    useTransactionMutations();
  const isManual = transaction.isManual;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openView(transaction)}>
          <Eye className="size-4 mr-2" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openEdit(transaction)}>
          <Pencil className="size-4 mr-2" />
          {isManual ? "Edit" : "Edit Category & Notes"}
        </DropdownMenuItem>

        {isManual ? (
          <DropdownMenuItem
            onClick={() => handleDelete(transaction.id)}
            disabled={isDeleting(transaction.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            {isDeleting(transaction.id) ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Ban className="size-4 mr-2" />
            Exclude from Analysis
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
