"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@neuralpay/ui/components/dialog";
import { Button } from "@neuralpay/ui/components/button";

interface PermissionPromptProps {
  open: boolean;
  isRequesting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PermissionPrompt({
  open,
  isRequesting,
  onConfirm,
  onCancel,
}: PermissionPromptProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable push notifications</DialogTitle>
          <DialogDescription>
            We need your browser permission to deliver push notifications.
            Please allow notifications in the prompt that appears.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isRequesting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isRequesting}>
            {isRequesting ? "Waiting..." : "Allow notifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
