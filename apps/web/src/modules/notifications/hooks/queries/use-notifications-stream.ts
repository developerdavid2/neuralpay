import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useNotificationStream() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 5;

    function connect() {
      // Clean up any existing connection
      esRef.current?.close();

      const es = new EventSource(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/notifications/stream`, // ← "notifications" not "notifcations"
        { withCredentials: true },
      );
      esRef.current = es;

      es.onopen = () => {
        console.log("[sse] connected");
        retryCount = 0; // reset on successful connection
      };

      es.onmessage = (e) => {
        if (!e.data || e.data.startsWith(":")) return; // skip heartbeats
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "notification.new") {
            queryClient.invalidateQueries(
              trpc.notifications.appNotifications.list.pathFilter(),
            );
            queryClient.invalidateQueries(
              trpc.notifications.appNotifications.unreadCount.pathFilter(),
            );
            window.dispatchEvent(
              new CustomEvent("inapp-notification", {
                detail: msg.notification,
              }),
            );
          }
        } catch {
          // malformed message — ignore
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;

        if (retryCount >= MAX_RETRIES) {
          console.warn("[sse] max retries reached, giving up");
          return;
        }

        // Exponential backoff — 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        retryCount++;
        console.log(`[sse] reconnecting in ${delay}ms (attempt ${retryCount})`);
        reconnectTimer.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [queryClient, trpc]);
}
