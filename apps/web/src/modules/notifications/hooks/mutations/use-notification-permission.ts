import { messaging } from "@/lib/notification-config";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

export function useNotificationPermission() {
  const trpc = useTRPC();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const registerDevice = useMutation(
    trpc.notifications.appNotifications.registerDevice.mutationOptions(),
  );

  useEffect(() => {
    if (!("Notification" in window) || !messaging) {
      setIsSupported(false);
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!messaging) return;
    const unsub = onMessage(messaging, (payload) => {
      window.dispatchEvent(
        new CustomEvent("push-notification", { detail: payload }),
      );
      const { title, body } = payload.notification ?? {};
      toast.info(title ?? "New notification", {
        description: body,
        duration: 8000,
      });
    });
    return () => unsub();
  }, []);

  // ✅ depend on mutateAsync, not the whole registerDevice object
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return null;
    setIsRequesting(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("Notification permission denied");
        return null;
      }
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });
      if (!token) {
        toast.error("Failed to get push token");
        return null;
      }
      await registerDevice.mutateAsync({
        token,
        platform: "web",
        deviceName: navigator.userAgent.slice(0, 100),
      });
      toast.success("Push notifications enabled!");
      return token;
    } catch (err) {
      console.error("[requestPermission]", err);
      toast.error("Failed to enable push notifications");
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [registerDevice.mutateAsync]); // ✅ stable reference

  const unregister = useCallback(async () => {
    if (!messaging) return;
    await deleteToken(messaging);
    setPermission("default");
  }, []);

  return {
    permission,
    isSupported,
    isRequesting,
    requestPermission,
    unregister,
  };
}
