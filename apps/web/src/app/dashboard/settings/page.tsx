import { ProfileSettingsView } from "@/modules/settings/pages/profile/ui/views/profile-settings-view";
import { HydrateClient, safePrefetch, trpc } from "@/trpc/trpc-server"; // Use safePrefetch

const Page = async () => {
  // await safePrefetch(trpc.users.profile.me.queryOptions());

  return (
    <HydrateClient>
      <ProfileSettingsView />
    </HydrateClient>
  );
};

export default Page;
