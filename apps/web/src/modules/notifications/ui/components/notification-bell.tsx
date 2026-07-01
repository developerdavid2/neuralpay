"use client";

import { cn } from "@neuralpay/ui/lib/utils";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUnreadCountNotifications } from "../../hooks/queries/use-unread-count-notifications";
import { NotificationDropdown } from "./notification-dropdown";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: serverCount = 0 } = useUnreadCountNotifications();

  // Optimistic bump — incremented instantly on push, reset when
  // the server count catches up (i.e. after invalidation refetch)
  const [optimisticDelta, setOptimisticDelta] = useState(0);
  const prevServerCount = useRef(serverCount);

  // When the server count changes (refetch resolved), reset the delta
  useEffect(() => {
    if (serverCount !== prevServerCount.current) {
      prevServerCount.current = serverCount;
      setOptimisticDelta(0);
    }
  }, [serverCount]);

  // Listen for instant push from the SSE hook
  useEffect(() => {
    const handler = () => setOptimisticDelta((d) => d + 1);
    window.addEventListener("inapp-notification", handler);
    return () => window.removeEventListener("inapp-notification", handler);
  }, []);

  const unreadCount = serverCount + optimisticDelta;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          open && "bg-accent text-accent-foreground",
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
