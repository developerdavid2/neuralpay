import { DashboardHeader } from "@/components/dashboard-header";
import { NotificationsClientShell } from "../components/notifications-client-shell";
import type { NotificationCategory } from "@neuralpay/types";

interface NotificationsViewProps {
  search?: string;
  category?: NotificationCategory | "all";
  status?: "all" | "read" | "unread";
  limit?: number;
}

export async function NotificationsView({
  search = "",
  category = "all",
  status = "all",
  limit = 20,
}: NotificationsViewProps) {
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
