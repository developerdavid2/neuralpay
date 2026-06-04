import { createAccountSchema, updateAccountSchema } from "@neuralpay/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@neuralpay/ui/components/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { Trash2, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@neuralpay/ui/lib/utils";
import { AccountFormFields } from "./account-form-fields";
import type { FormValues } from "../../types";

export function AccountForm({
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
    ? updateAccountSchema.omit({ id: true })
    : createAccountSchema.omit({ isManual: true });

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
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <DrawerHeader className="px-6 py-4 border-b space-y-1 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <DrawerTitle className="text-lg">
              {isEdit ? "Edit Account" : "New Account"}
            </DrawerTitle>
            <DrawerDescription>
              {isEdit
                ? "Update your account details"
                : "Add a new bank account"}
            </DrawerDescription>
          </div>

          <div className="flex items-center gap-1 -mr-2 -mt-2">
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
                title="Delete account"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
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
                onClick={() => {
                  clearUrl();
                  onClose();
                }}
                disabled={formDisabled}
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
        <AccountFormFields form={form} disabled={formDisabled} />
      </div>

      <DrawerFooter className="px-6 py-4 border-t shrink-0">
        <Button
          type="submit"
          disabled={formDisabled || (isEdit && !form.formState.isValid)}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Account"
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
