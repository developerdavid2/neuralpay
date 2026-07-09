"use client";

import { useCallback, useState, type JSX, type ReactNode } from "react";
import { Button } from "@neuralpay/ui/components/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@neuralpay/ui/components/alert-dialog";

type ConfirmVariant = "default" | "destructive";

export type ConfirmOptions = {
  title: string;
  message: ReactNode;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const useConfirm = (): [
  () => JSX.Element | null,
  (options: ConfirmOptions) => Promise<boolean>,
] => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (nextOptions: ConfirmOptions) => {
      promise?.resolve(false);
      return new Promise<boolean>((resolve) => {
        setOptions(nextOptions);
        setPromise({ resolve });
      });
    },
    [promise],
  );

  const handleClose = () => {
    promise?.resolve(false);
    setPromise(null);
    setOptions(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
    setOptions(null);
  };

  const handleCancel = () => {
    promise?.resolve(false);
    setPromise(null);
    setOptions(null);
  };

  const ConfirmationDialog = () => {
    if (!options) return null;

    const variant = options.variant ?? "default";

    return (
      <AlertDialog
        open={!!promise}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              {options.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{options.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <Button variant="ghost" onClick={handleCancel}>
              {options.cancelLabel ?? "Cancel"}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {options.confirmLabel ?? "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return [ConfirmationDialog, confirm];
};
