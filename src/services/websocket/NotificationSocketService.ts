import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type NotificationType =
  | "MATCH_CREATED"
  | "LINEUP_SUBMITTED"
  | "LINEUP_UPDATED"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | string;

export type NotificationDTO = {
  id: number;
  receiverId: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: number;
  referenceType?: string;
  createdAt: string;
};

export type RealtimeEventDTO = {
  type: string;
  referenceId: number;
  referenceType: string;
  action: string;
  payload?: unknown;
  createdAt: string;
};

let stompClient: Client | null = null;

const NotificationSocketService = {
  connect(
    userId: number,
    onNotification: (notification: NotificationDTO) => void,
    onRealtimeEvent?: (event: RealtimeEventDTO) => void,
  ) {
    if (stompClient) {
      void stompClient.deactivate();
      stompClient = null;
    }

    stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: (message) => {
        console.log("[STOMP]", message);
      },
      onConnect: () => {
        console.log("WebSocket connected");

        const notificationTopic = `/topic/users/${userId}/notifications`;
        const eventTopic = `/topic/users/${userId}/events`;

        console.log("Subscribe notification topic", notificationTopic);
        stompClient?.subscribe(notificationTopic, (message: IMessage) => {
          const notification = JSON.parse(message.body) as NotificationDTO;
          console.log("Received notification", notification);
          onNotification(notification);
        });

        console.log("Subscribe event topic", eventTopic);
        stompClient?.subscribe(eventTopic, (message: IMessage) => {
          const event = JSON.parse(message.body) as RealtimeEventDTO;
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
    stompClient?.deactivate();
    stompClient = null;
  },
};

export default NotificationSocketService;
