import { ProfileSettingsView } from "@/modules/settings/pages/profile/ui/views/profile-settings-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

const Page = async () => {
  // Await this query so server-side hydration works flawlessly
  await prefetch(trpc.users.profile.me.queryOptions());

  return (
    <HydrateClient>
      <ProfileSettingsView />
    </HydrateClient>
  );
};

export default Page;
