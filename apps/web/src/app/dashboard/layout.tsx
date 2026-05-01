import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (!session.user.emailVerified) {
    redirect("/auth/verify-otp");
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard header, sidebar, etc. */}
      {children}
    </div>
  );
}
