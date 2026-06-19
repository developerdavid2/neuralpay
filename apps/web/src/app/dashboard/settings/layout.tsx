import { DashboardHeader } from "@/components/dashboard-header";
import SettingsLayout from "@/modules/settings/layouts/sessions-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <SettingsLayout>{children}</SettingsLayout>;
};

export default Layout;
