import {
	validateBudgetPeriod,
	validateBudgetStatuses,
	validateSortField,
} from "@/modules/budgets/lib/validate-budget-params";
import type { BudgetQueryState } from "@/modules/budgets/types";
import { BudgetsView } from "@/modules/budgets/ui/views/budgets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

interface PageProps {
	searchParams: Promise<{
		view?: string;
		month?: string;
		year?: string;
		search?: string;
		status?: string | string[];
		isActive?: string;
		period?: string;
		sortField?: string;
		sortDir?: string;
		limit?: string;
		focusBudgetId?: string;
		mode?: string;
	}>;
}

const Page = async ({ searchParams }: PageProps) => {
	const params = await searchParams;
	const now = new Date();

	const viewMode = params.view === "list" ? "list" : "calendar";
	const month = Number(params.month) || now.getMonth() + 1;
	const year = Number(params.year) || now.getFullYear();

	const queryState: BudgetQueryState = {
		search: params.search?.trim() ?? undefined,
		statuses: validateBudgetStatuses(params.status) ?? [],
		isActive: params.isActive !== "false",
		period: validateBudgetPeriod(params.period),
		sortField:
			(validateSortField(params.sortField) as BudgetQueryState["sortField"]) ??
			"date",
		sortDir: params.sortDir === "asc" ? "asc" : "desc",
		limit: Math.min(Math.max(Number(params.limit) || 10, 1), 100),
	};

	const listInput = queryState;

	prefetch(
		trpc.payments.budgets.list.infiniteQueryOptions(listInput, {
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		}),
	);

	prefetch(trpc.payments.budgets.calendar.queryOptions({ month, year }));

	prefetch(
		trpc.payments.budgets.monthlyStats.queryOptions({
			month,
			year,
		}),
	);

	if (params.focusBudgetId) {
		prefetch(
			trpc.payments.budgets.getById.queryOptions({
				id: params.focusBudgetId,
			}),
		);
	}

	return (
		<HydrateClient>
			<BudgetsView
				queryState={queryState}
				month={month}
				year={year}
				viewMode={viewMode}
				focusBudgetId={params.focusBudgetId}
				focusMode={params.mode}
			/>
		</HydrateClient>
	);
};

export default Page;
