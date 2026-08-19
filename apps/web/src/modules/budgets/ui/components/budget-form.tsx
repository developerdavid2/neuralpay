import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetSchema, updateBudgetFormSchema } from "@orra/types";
import { Button } from "@orra/ui/components/button";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@orra/ui/components/sheet";
import { Spinner } from "@orra/ui/components/spinner";
import { cn } from "@orra/ui/lib/utils";
import { Trash2, X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import type { FormValues } from "../../types";
import { BudgetFormFields } from "./budget-form-fields";

export function BudgetForm({
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
  const schema = isEdit ? updateBudgetFormSchema : createBudgetSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
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
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      <SheetHeader className="px-6 py-4 border-b space-y-1 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-lg">
              {isEdit ? "Edit Budget" : "New Budget"}
            </SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update your budget details"
                : "Set a spending limit for a category"}
            </SheetDescription>
          </div>
          <div className="flex items-center gap-1 -mr-2">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                disabled={formDisabled}
                title="Delete budget"
              >
                {isDeleting ? (
                  <Spinner className="size-4" />
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

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
        <FormProvider {...form}>
          <BudgetFormFields form={form} disabled={formDisabled} />
        </FormProvider>
      </div>

      <SheetFooter className="px-6 py-4 border-t shrink-0">
        <Button type="submit" disabled={formDisabled} className="w-full">
          {isSaving ? (
            <>
              <Spinner className="size-4 mr-2" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Budget"
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
