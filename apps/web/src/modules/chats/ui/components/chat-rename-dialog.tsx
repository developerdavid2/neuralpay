// components/chat-rename-dialog.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ChatSession } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@neuralpay/ui/components/dialog";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import { Pencil } from "lucide-react";

const renameSchema = z.object({
  title: z.string().min(1).max(100),
});

type RenameFormData = z.infer<typeof renameSchema>;

interface ChatRenameDialogProps {
  session: ChatSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (sessionId: string, title: string) => void;
  isPending: boolean;
}

export function ChatRenameDialog({
  session,
  open,
  onOpenChange,
  onRename,
  isPending,
}: ChatRenameDialogProps) {
  const form = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: session.title },
  });

  // Reset form when session changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ title: session.title });
    }
  }, [open, session.title, form]);

  const handleSubmit = (data: RenameFormData) => {
    if (data.title === session.title) {
      onOpenChange(false);
      return;
    }
    onRename(session.id, data.title);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4" />
            Rename conversation
          </DialogTitle>
          <DialogDescription>
            Change the title of this chat session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-title">Title</Label>
            <Input
              id="chat-title"
              {...form.register("title")}
              placeholder="Enter conversation title..."
              autoFocus
              autoComplete="off"
              className="h-10"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Context info — read-only, for awareness */}
          {session.contextType !== "general" && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <p>
                Context:{" "}
                <span className="font-medium capitalize">
                  {session.contextType}
                </span>
                {session.contextId && (
                  <span className="ml-1">
                    ({session.contextId.slice(0, 8)}...)
                  </span>
                )}
              </p>
              <p className="mt-0.5">
                Topic:{" "}
                <span className="font-medium capitalize">
                  {session.topic ?? "general"}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
