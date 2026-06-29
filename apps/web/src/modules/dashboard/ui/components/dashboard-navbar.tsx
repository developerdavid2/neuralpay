"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { NotificationToast } from "@/components/notification-toast";
import { useNotificationPermission } from "@/modules/notifications/hooks/mutations/use-notification-permission";
import { useNotificationStream } from "@/modules/notifications/hooks/queries/use-notifications-stream";
import { NotificationBell } from "@/modules/notifications/ui/components/notification-bell";
import { Button } from "@neuralpay/ui/components/button";
import { Separator } from "@neuralpay/ui/components/separator";
import { SidebarTrigger } from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";
import { BellRing, SearchIcon } from "lucide-react";

const DashboardNavbar = () => {
  const { requestPermission } = useNotificationPermission();
  useNotificationStream(); // ← SSE connection

  return (
    <>
      <NotificationToast />
      <nav className="flex px-4 gap-x-2 items-center py-3 border-b shadow-xs bg-sidebar shrink-0 fixed w-full z-50">
        <SidebarTrigger className={cn("size-9 cursor-pointer")} />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Button
          className="h-9 w-fit justify-start font-normal text-muted-foreground hover:text-muted-foreground"
          variant="outline"
          size="sm"
          onClick={() => {}}
        >
          <SearchIcon />
          Search or type a command
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
        <ModeToggle />

        <NotificationBell />
        <button
          onClick={async () => {
            const token = await requestPermission();
            if (token) console.log("Push registered:", token);
          }}
          className="p-2 rounded-lg hover:bg-muted"
        >
          <BellRing className="size-5" />
        </button>
      </nav>
    </>
  );
};

export default DashboardNavbar;
