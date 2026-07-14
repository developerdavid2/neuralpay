import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/modules/notifications/ui/components/notification-bell";
import { SidebarTrigger } from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";

const DashboardNavbar = () => {
  return (
    <nav className="flex px-4 items-center justify-between p-3 border-b shadow-xs bg-sidebar sticky top-0 z-20 w-full">
      <SidebarTrigger className={cn("size-9 cursor-pointer")} />

      <div className="gap-x-2 flex items-center">
        <ModeToggle />
        <NotificationBell />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
