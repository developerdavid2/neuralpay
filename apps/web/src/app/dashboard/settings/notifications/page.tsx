import { NotificationsSettingsView } from "@/modules/settings/notifications/ui/views/notification-settings-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

const Page = async () => {
  void prefetch(
    trpc.notifications.appNotifications.getPreferences.queryOptions(),
  );

  return (
    <HydrateClient>
      <NotificationsSettingsView />
    </HydrateClient>
  );
};

export default Page;
