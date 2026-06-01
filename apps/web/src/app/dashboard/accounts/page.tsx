import { AccountsView } from "@/modules/accounts/ui/views/accounts-view";
import { ACCOUNTS_LIMIT } from "@/modules/accounts/constants";
import {
  validateAccountStatuses,
  validateAccountTypes,
} from "@/modules/accounts/lib/validate-accounts-enums";
import {
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    types?: string | string[];
    tags?: string[];
    statuses?: string | string[];
    isManual?: string;
    limit?: string;
    focusId?: string;
    mode?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const parsedLimit = Number(params.limit ?? ACCOUNTS_LIMIT);

  const limit = Math.min(
    Math.max(Number.isFinite(parsedLimit) ? parsedLimit : ACCOUNTS_LIMIT, 1),
    50,
  );

  const validatedTypes = validateAccountTypes(params.types);
  const validatedStatuses = validateAccountStatuses(params.statuses);

  const listFilters = {
    limit,
    search: params.search?.trim() || undefined,
    type: validatedTypes,
    status: validatedStatuses,
    isManual: params.isManual === "true" ? true : undefined,
  };

  void prefetchInfinite(
    trpc.payments.accounts.list.infiniteQueryOptions(listFilters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  void prefetch(trpc.payments.accounts.aggregateByType.queryOptions());

  return (
    <HydrateClient>
      <AccountsView
        search={params.search ?? ""}
        types={validatedTypes ?? []}
        statuses={validatedStatuses ?? []}
        tags={params.tags ?? []}
        isManual={params.isManual === "true"}
        focusAccountId={params.focusId}
        focusMode={params.mode}
        limit={limit}
      />
    </HydrateClient>
  );
};

export default Page;
