import { useEffect } from "react";
import type { RealtimeEventDTO } from "../model/RealtimeEvent";

type RealtimeEventHandler = (event: RealtimeEventDTO) => void;

export function useRealtimeEvent(handler: RealtimeEventHandler) {
  useEffect(() => {
    // Xử lý listener.
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<RealtimeEventDTO>;
      if (customEvent.detail) {
        handler(customEvent.detail);
      }
    };

    window.addEventListener("app-realtime-event", listener);

    return () => {
      window.removeEventListener("app-realtime-event", listener);
    };
  }, [handler]);
}
