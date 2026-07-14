import { getFirebaseMessaging } from "@/lib/notification-config";
import { useTRPC } from "@/trpc/trpc-client";
import {
  deleteToken,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRegisterDevice } from "./use-register-device";

export function useNotificationPermission() {
  const trpc = useTRPC();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  const registerDevice = useRegisterDevice();

  // Resolve the Messaging instance once, client-side only.
  useEffect(() => {
    let cancelled = false;

    if (!("Notification" in window)) {
      setIsSupported(false);
      return;
    }

    getFirebaseMessaging().then((instance) => {
      if (cancelled) return;
      if (!instance) {
        setIsSupported(false);
        return;
      }
      setMessaging(instance);
      setPermission(Notification.permission);
    });

    return () => {
      cancelled = true;
    };
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
  }, [messaging]);

  const requestPermission = useCallback(async () => {
    if (!messaging) return null;
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
  }, [messaging, registerDevice.mutateAsync]);

  const unregister = useCallback(async () => {
    if (!messaging) return;
    await deleteToken(messaging);
    setPermission("default");
  }, [messaging]);

  return {
    permission,
    isSupported,
    isRequesting,
    requestPermission,
    unregister,
  };
}
