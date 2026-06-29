"use client";

import { useEffect } from "react";
import { useNotificationPermission } from "@/modules/notifications/hooks/mutations/use-notification-permission";
import { useNotificationStream } from "@/modules/notifications/hooks/queries/use-notifications-stream";

export function NotificationInitializer() {
  const { permission, requestPermission } = useNotificationPermission();

  useNotificationStream();

  useEffect(() => {
    if (permission === "default" && "Notification" in window) {
      const timer = setTimeout(() => {
        requestPermission();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [permission, requestPermission]);

  return null;
}
