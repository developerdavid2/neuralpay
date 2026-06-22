import { DashboardHeader } from "@/components/dashboard-header";
import { SettingsSidebar } from "../components/settings-sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col p-10 pb-5">
      <div className="">
        <DashboardHeader
          title="Settings"
          description="Manage preferences and configurations"
        />
      </div>
      <div className="flex flex-row h-full rounded-md overflow-hidden mt-5 bg-card">
        <SettingsSidebar />
        <main className="flex-1 h-full p-6 lg:p-8 overflow-y-auto">
          <div className=" ">{children}</div>
        </main>
      </div>
    </div>
  );
}
