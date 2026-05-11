// apps/web/src/app/dashboard/accounts/page.tsx
import { AccountView } from "@/modules/accounts/account-view";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/trpc-server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const Page = async () => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.users.profile.me.queryOptions());

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
