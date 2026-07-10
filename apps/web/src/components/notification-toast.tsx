import { useEffect } from "react";

export function NotificationToast() {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const n = e.detail;
    };
    window.addEventListener("inapp-notification", handler as EventListener);
    return () =>
      window.removeEventListener(
        "inapp-notification",
        handler as EventListener,
      );
  }, []);

  return null;
}
