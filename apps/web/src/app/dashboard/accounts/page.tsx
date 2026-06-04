import { ACCOUNTS_LIMIT } from "@/modules/accounts/constants";
import {
  validateAccountStatuses,
  validateAccountTypes,
} from "@/modules/accounts/lib/validate-accounts-enums";
import { AccountsView } from "@/modules/accounts/ui/views/accounts-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    types?: string | string[];
    tags?: string[];
    statuses?: string | string[];
    isManual?: string;
    limit?: string;
    page?: string;
    focusId?: string;
    mode?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const parsedLimit = Number(params.limit ?? ACCOUNTS_LIMIT);
  const page = Math.max(Number(params.page ?? 1), 1);

  const limit = Math.min(
    Math.max(Number.isFinite(parsedLimit) ? parsedLimit : ACCOUNTS_LIMIT, 1),
    50,
  );

  const validatedTypes = validateAccountTypes(params.types);
  const validatedStatuses = validateAccountStatuses(params.statuses);

  const listFilters = {
    limit,
    page,
    search: params.search?.trim() || undefined,
    type: validatedTypes,
    status: validatedStatuses,
    isManual: params.isManual === "true" ? true : undefined,
  };

  void prefetch(trpc.payments.accounts.list.queryOptions(listFilters));

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
        currentPage={page}
      />
    </HydrateClient>
  );
};

export default Page;
