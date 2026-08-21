"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStartSession } from "@/modules/chats/hooks/mutations/use-start-session";
import { ChatInput } from "@/modules/chats/ui/components/chat-input";
import { Avatar, AvatarFallback } from "@orra/ui/components/avatar";
import { Bot } from "lucide-react";

function NewChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("initialMessage") ?? "";
  const mode = searchParams.get("mode") ?? "plan";
  const model = searchParams.get("model") ?? "";
  const startSession = useStartSession();
  const hasCreated = useRef(false);

  useEffect(() => {
    if (hasCreated.current) return;
    if (!initialMessage.trim()) {
      router.replace("/dashboard/ai-chat" as Route);
      return;
    }

    hasCreated.current = true;

    startSession.mutateAsync(
      {
        contextType: "general",
        topic: "general",
        title: initialMessage.slice(0, 50),
      },
      {
        onSuccess: (session) => {
          router.replace(
            `/dashboard/ai-chat/${session.id}?initialMessage=${encodeURIComponent(initialMessage)}&mode=${mode}&model=${model}` as Route,
          );
        },
        onError: () => {
          toast.error("Failed to create chat session");
          router.replace("/dashboard/ai-chat" as Route);
        },
      },
    );
  }, [initialMessage, mode, model, router, startSession]);

  if (!initialMessage.trim()) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 px-4 h-full">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex gap-3 flex-row-reverse">
          <Avatar className="size-8 shrink-0 bg-primary">
            <AvatarFallback className="text-primary-foreground text-xs">
              U
            </AvatarFallback>
          </Avatar>
          <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 text-sm">
            {initialMessage}
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar className="size-8 shrink-0 bg-muted">
            <AvatarFallback>
              <Bot className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">
            <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="size-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
      <NewChatContent />
    </Suspense>
  );
}
