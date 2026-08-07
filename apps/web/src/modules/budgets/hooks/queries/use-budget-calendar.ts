import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useBudgetCalendar({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const trpc = useTRPC();
  const { data: budgetsCalendar } = useSuspenseQuery(
    trpc.payments.budgets.calendar.queryOptions({ month, year }),
  );

  return { budgetsCalendar };
}
