// apps/web/src/app/dashboard/accounts/page.tsx
import { AccountView } from "@/modules/accounts/account-view";
import {
  getQueryClient,
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const Page = async () => {
  const listFilters = {};

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
