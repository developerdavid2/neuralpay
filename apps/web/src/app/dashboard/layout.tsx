import { requireAuth } from "@/lib/auth-server";
import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Server-side gate: an unauthenticated user is redirected to sign-in before
  // the dashboard shell (sidebar/navbar) is ever rendered, so no layout leaks.
  await requireAuth();

  return (
    <DashboardLayout>
      <AuthGuard>{children}</AuthGuard>
    </DashboardLayout>
  );
};

export default Layout;
