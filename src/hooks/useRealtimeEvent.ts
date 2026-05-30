import { useEffect } from "react";
import type { RealtimeEventDTO } from "../services/websocket/NotificationSocketService";

type RealtimeEventHandler = (event: RealtimeEventDTO) => void;

export function useRealtimeEvent(handler: RealtimeEventHandler) {
  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<RealtimeEventDTO>;
      handler(customEvent.detail);
    };

    window.addEventListener("app-realtime-event", listener);

    return () => {
      window.removeEventListener("app-realtime-event", listener);
    };
  }, [handler]);
}
