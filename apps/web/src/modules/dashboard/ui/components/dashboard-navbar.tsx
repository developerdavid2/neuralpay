"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/modules/notifications/ui/components/notification-bell";
import { SidebarTrigger, useSidebar } from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";

const DashboardNavbar = () => {
  const { state, isMobile } = useSidebar();

  return (
    <nav
      className={cn(
        "fixed top-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-sidebar px-4 shadow-xs",
        "transition-[left] duration-200 ease-linear",
        isMobile
          ? "left-0"
          : state === "expanded"
            ? "left-(--sidebar-width)"
            : "left-(--sidebar-width-icon)",
      )}
    >
      <SidebarTrigger className={cn("size-9 cursor-pointer")} />
      <div className="flex items-center gap-x-2">
        <ModeToggle />
        <NotificationBell />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
