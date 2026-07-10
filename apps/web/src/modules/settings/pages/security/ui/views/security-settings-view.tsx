import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  ActiveSessionSkeleton,
  ActiveSessionsSection,
} from "../components/active-sessions-section";
import { PasswordSection } from "../components/password-section";
import { SecuritySettingsSkeleton } from "../components/security-settings-content";
import { TwoFactorSection } from "../components/two-factor-section";

export function SecuritySettingsView() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="Security"
        description="Manage your account password and add an extra layer of security to your account"
      />

      <SectionBoundary
        fallback={<SecuritySettingsSkeleton />}
        errorMessage="Could not load security settings"
      >
        <PasswordSection />
      </SectionBoundary>
      <SectionBoundary
        fallback={<SecuritySettingsSkeleton />}
        errorMessage="Could not load two factor settings"
      >
        <TwoFactorSection />
      </SectionBoundary>
      <SectionBoundary
        fallback={<ActiveSessionSkeleton />}
        errorMessage="Could not load active sessions"
      >
        <ActiveSessionsSection />
      </SectionBoundary>
    </div>
  );
}
