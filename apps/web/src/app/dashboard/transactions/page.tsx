import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import {
  validateTransactionCategories,
  validateTransactionStatuses,
  validateTransactionTypes,
} from "@/modules/transactions/lib/validate-transaction-enums";
import { TransactionsView } from "@/modules/transactions/ui/views/transactions-view";
import {
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    types?: string | string[];
    statuses?: string | string[];
    accountType?: string;
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
    categories?: string | string[];
    isManual?: string;
    isAnomaly?: string;
    amountMin?: string;
    amountMax?: string;
    focus?: string;
    limit?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const limit = Math.min(
    Math.max(Number(params.limit ?? TRANSACTIONS_LIMIT), 1),
    50,
  );
  console.log(
    "Server limit:",
    limit,
    "params.limit:",
    params.limit,
    "constant:",
    TRANSACTIONS_LIMIT,
  );

  const validatedType = validateTransactionTypes(params.types);
  const validatedStatuses = validateTransactionStatuses(params.statuses);
  const validatedCategories = validateTransactionCategories(params.categories);

  const listFilters = {
    limit,
    search: params.search?.trim() || undefined,
    type: validatedType,
    status: validatedStatuses,
    bankAccountId: params.accountId || undefined,
    category: validatedCategories,
    isManual: params.isManual === "true" ? true : undefined,
    isAnomaly: params.isAnomaly === "true" ? true : undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    minAmount: params.amountMin ? Number(params.amountMin) : undefined,
    maxAmount: params.amountMax ? Number(params.amountMax) : undefined,
  };

  void prefetchInfinite(
    trpc.payments.transactions.list.infiniteQueryOptions(listFilters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  if (params.focus) {
    void prefetch(
      trpc.payments.transactions.getById.queryOptions({ id: params.focus }),
    );
  }

  return (
    <HydrateClient>
      <TransactionsView
        search={params.search ?? ""}
        types={validatedType ?? []}
        statuses={validatedStatuses ?? []}
        categories={validatedCategories ?? []}
        accountType={params.accountType ?? "all"}
        accountId={params.accountId ?? ""}
        dateFrom={params.dateFrom ?? ""}
        dateTo={params.dateTo ?? ""}
        isManual={params.isManual === "true"}
        isAnomaly={params.isAnomaly === "true"}
        amountMin={params.amountMin ?? ""}
        amountMax={params.amountMax ?? ""}
        focusTransactionId={params.focus}
        limit={limit}
      />
    </HydrateClient>
  );
}
