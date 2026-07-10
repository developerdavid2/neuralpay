import { ProfileSettingsView } from "@/modules/settings/pages/profile/ui/views/profile-settings-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

const Page = async () => {
  void prefetch(trpc.users.profile.me.queryOptions());

  return (
    <HydrateClient>
      <ProfileSettingsView />
    </HydrateClient>
  );
};

export default Page;
