"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

const filters = {
  limit: 50,
};

export const ChatsView = () => {
  const trpc = useTRPC();

  // ✅ CORRECT: pass the options object directly
  const { data } = useSuspenseInfiniteQuery(
    trpc.ai.coach.sessions.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  // Flatten pages for display
  const sessions = data.pages.flatMap((page) => page.items);

  return (
    <div className="flex h-full w-full flex-col">
      <pre>{JSON.stringify(sessions, null, 2)}</pre>
    </div>
  );
};
