import type { BudgetsListInput } from "@orra/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/trpc-client";

export function useBudgetsList(input: BudgetsListInput) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery({
    ...trpc.payments.budgets.list.infiniteQueryOptions(input, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  });

  const budgets = useMemo(() => {
    const flat = query.data.pages.flatMap((p) => p.items) ?? [];
    const seen = new Map<string, (typeof flat)[number]>();
    for (const b of flat) seen.set(b.id, b);
    return Array.from(seen.values());
  }, [query]);
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; date: Date; budgets: typeof budgets }
    >();

    for (const budget of budgets) {
      const anchor = budget.startDate ?? new Date(budget.createdAt);
      const key = format(anchor, "yyyy-MM");
      const existing = map.get(key);

      if (existing) {
        existing.budgets.push(budget);
      } else {
        map.set(key, {
          key,
          date: new Date(anchor.getFullYear(), anchor.getMonth()),
          budgets: [budget],
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [budgets]);

  return {
    ...query,
    budgets,
    groups,
    isLoading: query.isPending,
  };
}
