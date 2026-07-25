import { ProfileSettingsView } from "@/modules/settings/pages/profile/ui/views/profile-settings-view";
import { HydrateClient } from "@/trpc/trpc-server"; // Use safePrefetch

const Page = async () => {
  return (
    <HydrateClient>
      <ProfileSettingsView />
    </HydrateClient>
  );
};

export default Page;
