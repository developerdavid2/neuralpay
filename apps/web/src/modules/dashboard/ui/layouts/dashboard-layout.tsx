import React from "react";

import { SidebarProvider } from "@neuralpay/ui/components/sidebar";
import { cookies } from "next/headers";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import DashboardNavbar from "../components/dashboard-navbar";

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardNavbar />
        <main className="flex flex-1 flex-col pt-14">{children}</main>
      </div>
    </SidebarProvider>
  );
};
