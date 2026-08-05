import { DashboardHeader } from "@/components/dashboard-header";
import { NotificationsClientShell } from "../components/notifications-client-shell";
import type { NotificationCategory } from "@neuralpay/types";

export async function NotificationsView() {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-10">
      <DashboardHeader
        title="Notifications"
        description="Stay on top of account activity, alerts, and smart insights"
      />

      <NotificationsClientShell />
    </div>
  );
}
