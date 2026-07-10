import { SecuritySettingsView } from "@/modules/settings/pages/security/ui/views/security-settings-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

const Page = async () => {
  void prefetch(trpc.users.security.getSessions.queryOptions());
  void prefetch(trpc.users.security.get2FAStatus.queryOptions());

  return (
    <HydrateClient>
      <SecuritySettingsView />
    </HydrateClient>
  );
};

export default Page;
