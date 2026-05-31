// apps/web/src/app/dashboard/accounts/page.tsx
import { AccountView } from "@/modules/accounts/account-view";
import { ACCOUNTS_LIMIT } from "@/modules/accounts/constants";
import {
  validateAccountStatuses,
  validateAccountTypes,
} from "@/modules/accounts/lib/validate-accounts-enums";
import { validateAccountType } from "@/modules/transactions/lib/validate-transaction-enums";
import { HydrateClient, prefetchInfinite, trpc } from "@/trpc/trpc-server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    types?: string | string[];
    tags?: string | string[];
    statuses?: string | string[];
    isManual?: string;
    limit?: string;
    focus?: string;
    mode?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const parseOptionalNumber = (value?: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
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

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <AccountView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
