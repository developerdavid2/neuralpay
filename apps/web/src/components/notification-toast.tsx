import { useEffect } from "react";

export function NotificationToast() {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const n = e.detail;
      console.log("[notification]", n.title, n.body);
      // Or use your toast library: toast.info(n.title, { description: n.body })
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
