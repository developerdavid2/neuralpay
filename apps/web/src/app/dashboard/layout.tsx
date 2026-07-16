import { requireAuth } from "@/lib/auth-server";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

export const dynamic = "force-dynamic";
const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
