"use client";

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
      esRef.current?.close();

      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/notifications/stream`;
      console.log("[SSE] connecting to", url);

      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        console.log("[SSE] ✅ connected");
        retryCount = 0;

        // Catch any notifications that arrived during the connection window
        queryClient.invalidateQueries(
          trpc.notifications.appNotifications.unreadCount.pathFilter(),
        );
        queryClient.invalidateQueries(
          trpc.notifications.appNotifications.list.pathFilter(),
        );
      };

      es.onmessage = (e) => {
        if (!e.data || e.data.startsWith(":")) {
          console.log("[SSE] 💓 heartbeat");
          return;
        }

        try {
          const msg = JSON.parse(e.data);
          console.log("[SSE] 📨 message received:", msg);

          if (msg.type === "notification.new") {
            console.log(
              "[SSE] 🔔 new notification, updating cache + dispatching event",
            );

            // 1. Instant UI feedback via custom event (optimistic bell bump)
            window.dispatchEvent(
              new CustomEvent("inapp-notification", {
                detail: msg.notification,
              }),
            );

            // 2. Background cache sync
            queryClient.invalidateQueries(
              trpc.notifications.appNotifications.list.pathFilter(),
            );
            queryClient.invalidateQueries(
              trpc.notifications.appNotifications.unreadCount.pathFilter(),
            );
          }
        } catch (err) {
          console.error("[SSE] ❌ failed to parse message:", e.data, err);
        }
      };

      es.onerror = (err) => {
        console.warn("[SSE] ⚠️ connection error, closing:", err);
        es.close();
        esRef.current = null;

        if (retryCount >= MAX_RETRIES) {
          console.warn("[SSE] 🛑 max retries reached, giving up");
          return;
        }

        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        retryCount++;
        console.log(
          `[SSE] 🔄 reconnecting in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`,
        );
        reconnectTimer.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      console.log("[SSE] 🔌 cleanup — closing connection");
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [queryClient, trpc]);
}
