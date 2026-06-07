import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { RealtimeEventDTO } from "../../model/RealtimeEvent";

const WS_URL = import.meta.env.VITE_WS_BASE_URL ?? "http://localhost:8080/ws";

class PublicSocketService {
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private activeTopicsKey = "";

  connect(
    topicSuffixes: string[],
    onRealtimeEvent: (event: RealtimeEventDTO) => void,
  ) {
    const normalizedTopics = Array.from(
      new Set(
        topicSuffixes
          .map((topic) => topic.trim().replace(/^\/+/, ""))
          .filter(Boolean),
      ),
    );

    if (normalizedTopics.length === 0) return;

    const nextKey = [...normalizedTopics].sort().join("|");

    if (this.client?.active && this.activeTopicsKey === nextKey) {
      return;
    }

    this.disconnect();
    this.activeTopicsKey = nextKey;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: import.meta.env.DEV
        ? (message) => console.log("[PUBLIC-WS]", message)
        : undefined,
      onConnect: () => {
        this.subscriptions = normalizedTopics.map((topic) =>
          this.client!.subscribe(
            `/topic/public/${topic}`,
            (message: IMessage) => {
              try {
                const payload = JSON.parse(message.body) as RealtimeEventDTO;
                onRealtimeEvent(payload);
              } catch (error) {
                console.error(
                  "Cannot parse public realtime websocket message",
                  error,
                  message.body,
                );
              }
            },
          ),
        );
      },
      onStompError: (frame) => {
        console.error(
          "Public websocket stomp error",
          frame.headers["message"],
          frame.body,
        );
      },
      onWebSocketError: (event) => {
        console.error("Public websocket error", event);
      },
    });

    this.client.activate();
  }

  // Ngắt kết nối dịch vụ realtime.
  disconnect() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
    this.activeTopicsKey = "";

    const client = this.client;
    this.client = null;
    void client?.deactivate();
  }
}

export default new PublicSocketService();
