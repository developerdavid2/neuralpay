import React from "react";
import { SidebarProvider } from "@neuralpay/ui/components/sidebar";
import { cookies } from "next/headers";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import DashboardNavbar from "../components/dashboard-navbar";
import { NotificationStreamProvider } from "@/components/notification-stream-provider";

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <NotificationStreamProvider />
      <DashboardSidebar />
      <div className="flex w-full flex-1 flex-col">
        <DashboardNavbar />
        <main className="flex flex-1 flex-col pt-14">{children}</main>
      </div>
    </SidebarProvider>
  );
};
