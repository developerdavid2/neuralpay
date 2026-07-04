"use client";

import { useNotificationPermission } from "@/modules/notifications/hooks/mutations/use-notification-permission";
import { useNotificationStream } from "@/modules/notifications/hooks/queries/use-notifications-stream";
import { useEffect } from "react";

export function NotificationStreamProvider() {
  const { permission, requestPermission } = useNotificationPermission();

  useNotificationStream();

  useEffect(() => {
    if (permission === "default" && "Notification" in window) {
      const timer = setTimeout(() => requestPermission(), 5000);
      return () => clearTimeout(timer);
    }
  }, [permission, requestPermission]);

  return null;
}
