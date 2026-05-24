"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function AccountView() {
  const trpc = useTRPC();
  const { data, error } = useSuspenseQuery(
    trpc.payments.accounts.list.queryOptions(),
  );

  return (
    <div className="p-8 text-foreground">
      <pre className="rounded-lg bg-muted p-4 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
