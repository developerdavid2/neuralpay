import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  NotificationSettingsContent,
  NotificationSettingsSkeleton,
} from "../components/notification-settings-content";

export function NotificationsSettingsView() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="Notification Settings"
        description="Configure how you receive alerts and updates across your account."
      />

      <SectionBoundary
        fallback={<NotificationSettingsSkeleton />}
        errorMessage="Could not load notification preferences"
      >
        <NotificationSettingsContent />
      </SectionBoundary>
    </div>
  );
}
