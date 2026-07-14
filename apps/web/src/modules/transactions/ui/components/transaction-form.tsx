import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@neuralpay/ui/components/sheet";
import { cn } from "@neuralpay/ui/lib/utils";
import { Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { FormValues } from "../../types";
import { TransactionFormFields } from "./transaction-form-fields";
import { Spinner } from "@neuralpay/ui/components/spinner";
export function TransactionForm({
  defaultValues,
  isEdit,
  isSaving,
  isDeleting = false,
  onSubmit,
  onDelete,
  onClose,
  clearUrl,
}: {
  defaultValues: FormValues;
  isEdit: boolean;
  isSaving: boolean;
  isDeleting?: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
  clearUrl: () => void;
}) {
  const schema = isEdit
    ? updateTransactionSchema.omit({ id: true })
    : createTransactionSchema.omit({ isManual: true });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues,
  });

  const formDisabled = isSaving || isDeleting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "relative flex flex-col flex-1 min-h-0",
        isDeleting && "pointer-events-none",
      )}
    >
      {isDeleting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
          <Spinner className="size-6  text-muted-foreground" />
        </div>
      )}
      {/* Header */}
      <SheetHeader className="px-6 py-4 border-b space-y-1 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-lg">
              {isEdit ? "Edit Transaction" : "New Transaction"}
            </SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update your transaction details"
                : "Add a manual transaction"}
            </SheetDescription>
          </div>

          <div className="flex items-center gap-1 -mr-2">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 text-muted-foreground hover:text-destructive",
                  isDeleting && "text-destructive",
                )}
                onClick={onDelete}
                disabled={formDisabled}
                title="Delete transaction"
              >
                {isDeleting ? (
                  <Spinner className="size-4 " />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            )}
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  clearUrl();
                  onClose();
                }}
                disabled={formDisabled}
              >
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetHeader>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
        <TransactionFormFields form={form} disabled={formDisabled} />
      </div>

      {/* Footer */}
      <SheetFooter className="px-6 py-4 border-t shrink-0">
        <Button
          type="submit"
          disabled={formDisabled || (isEdit && !form.formState.isValid)}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Spinner className="size-4  mr-2" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Transaction"
          )}
        </Button>

        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={formDisabled}
          >
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}
