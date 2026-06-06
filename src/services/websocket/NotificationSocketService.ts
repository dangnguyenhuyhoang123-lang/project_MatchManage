import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  NotificationDTO as BaseNotificationDTO,
  RealtimeEventDTO,
} from "../../model/RealtimeEvent";

export type NotificationType =
  | "MATCH_CREATED"
  | "LINEUP_SUBMITTED"
  | "LINEUP_UPDATED"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | string;

export type NotificationDTO = BaseNotificationDTO & {
  id: number;
  title: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  receiverId?: number;
  createdAt: string | null;
};

export type {
  RealtimeAction,
  RealtimeEventDTO,
} from "../../model/RealtimeEvent";

let stompClient: Client | null = null;
let currentUserId: number | null = null;

const WS_URL = import.meta.env.VITE_WS_BASE_URL ?? "http://localhost:8080/ws";

function parseSocketMessage<T>(message: IMessage, label: string): T | null {
  try {
    return JSON.parse(message.body) as T;
  } catch (error) {
    console.warn(
      `[WebSocket] Cannot parse ${label} message`,
      error,
      message.body,
    );
    return null;
  }
}

const NotificationSocketService = {
  connect(
    userId: number,
    onNotification: (notification: NotificationDTO) => void,
    onRealtimeEvent?: (event: RealtimeEventDTO) => void,
  ) {
    if (stompClient?.active && currentUserId === userId) {
      return;
    }

    this.disconnect();
    currentUserId = userId;

    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: import.meta.env.DEV
        ? (message) => console.log("[STOMP]", message)
        : undefined,
      onConnect: () => {
        console.log("WebSocket connected");

        const notificationTopic = `/topic/users/${userId}/notifications`;
        const eventTopic = `/topic/users/${userId}/events`;

        console.log("Subscribe notification topic", notificationTopic);
        stompClient?.subscribe(notificationTopic, (message: IMessage) => {
          const notification = parseSocketMessage<NotificationDTO>(
            message,
            "notification",
          );
          if (!notification) return;

          console.log("Received notification", notification);
          onNotification(notification);
        });

        console.log("Subscribe event topic", eventTopic);
        stompClient?.subscribe(eventTopic, (message: IMessage) => {
          const event = parseSocketMessage<RealtimeEventDTO>(
            message,
            "realtime event",
          );
          if (!event) return;

          console.log("Received realtime event", event);
          onRealtimeEvent?.(event);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
    });

    stompClient.activate();
  },

  disconnect() {
    const client = stompClient;
    stompClient = null;
    currentUserId = null;
    void client?.deactivate();
  },
};

export default NotificationSocketService;
