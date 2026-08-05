import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useSseStream() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) return;

    const isLocal = window.location.hostname === "localhost";
    const url = isLocal
      ? `${process.env.NEXT_PUBLIC_API_URL}/stream`
      : `/api/stream/notifications`;
    const es = new EventSource(url, {
      withCredentials: true,
    });

    es.onmessage = (e) => {
      if (e.data.startsWith(":heartbeat")) return;
      const msg = JSON.parse(e.data);
      if (msg.type === "notification.new") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unreadCount"],
        });
        window.dispatchEvent(
          new CustomEvent("inapp-notification", { detail: msg.notification }),
        );
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setTimeout(connect, 3000);
    };

    esRef.current = es;
  }, [queryClient]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);
}
