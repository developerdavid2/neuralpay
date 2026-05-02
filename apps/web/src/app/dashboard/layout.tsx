import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

export const dynamic = "force-dynamic";
const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
