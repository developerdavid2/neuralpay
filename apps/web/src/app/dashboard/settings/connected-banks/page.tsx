import { ConnectedBanksView } from "@/modules/settings/connected-banks/ui/views/connected-banks-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

export default async function ConnectedBanksPage() {
  void prefetch(trpc.payments.plaid.getConnectedBank.queryOptions());

  try {
    void prefetch(
      trpc.payments.accounts.listAll.queryOptions({ isManual: false }),
    );
  } catch {
    // Bank not connected, skip prefetch
  }

  return (
    <HydrateClient>
      <ConnectedBanksView />
    </HydrateClient>
  );
}
