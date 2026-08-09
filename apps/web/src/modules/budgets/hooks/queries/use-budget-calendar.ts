import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useBudgetCalendar({
	month,
	year,
}: {
	month: number;
	year: number;
}) {
	const trpc = useTRPC();
	const { data: calendarData } = useSuspenseQuery(
		trpc.payments.budgets.calendar.queryOptions({ month, year }),
	);

	return { calendarData };
}
