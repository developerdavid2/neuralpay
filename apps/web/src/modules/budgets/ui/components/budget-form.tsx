import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@neuralpay/ui/components/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import { Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BUDGET_CATEGORY, BUDGET_PERIODS } from "@neuralpay/types";
import { BudgetFormFields } from "./budget-form-fields";
import type { BudgetFormValues } from "../../types";

// Client-side form schema — mirrors createBudgetSchema minus server defaults.
const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(120),
    description: z.string().max(500).optional(),
    category: z.enum(BUDGET_CATEGORY),
    limitAmount: z.number().positive("Limit must be greater than 0"),
    color: z.string().max(20).optional(),
    period: z.enum(BUDGET_PERIODS),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    alertThreshold: z.number().int().min(1).max(100),
    accountIds: z.array(z.string()),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export function BudgetForm({
  defaultValues,
  isEdit,
  isSaving,
  isDeleting = false,
  onSubmit,
  onDelete,
  onClose,
}: {
  defaultValues: BudgetFormValues;
  isEdit: boolean;
  isSaving: boolean;
  isDeleting?: boolean;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
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
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      <DrawerHeader className="px-6 py-4 border-b space-y-1 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <DrawerTitle className="text-lg">
              {isEdit ? "Edit Budget" : "New Budget"}
            </DrawerTitle>
            <DrawerDescription>
              {isEdit
                ? "Update your budget details"
                : "Set a spending limit for a category"}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-1 -mr-2 -mt-2">
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
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onClose}
                disabled={formDisabled}
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
        <BudgetFormFields form={form} disabled={formDisabled} />
      </div>

      <DrawerFooter className="px-6 py-4 border-t shrink-0">
        <Button
          type="submit"
          disabled={formDisabled || !form.formState.isValid}
          className="w-full"
        >
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
        <DrawerClose asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={formDisabled}
          >
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </form>
  );
}
