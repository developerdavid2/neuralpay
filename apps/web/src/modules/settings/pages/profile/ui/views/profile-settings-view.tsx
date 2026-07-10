import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  ProfileSettingsContent,
  ProfileSettingsSkeleton,
} from "../components/profile-settings-content";

export function ProfileSettingsView() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="General"
        description="Manage your profile and preferences"
      />

      <SectionBoundary
        fallback={<ProfileSettingsSkeleton />}
        errorMessage="Could not load profile"
      >
        <ProfileSettingsContent />
      </SectionBoundary>
    </div>
  );
}
