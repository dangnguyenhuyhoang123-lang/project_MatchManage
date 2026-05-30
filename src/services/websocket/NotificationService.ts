import axiosClient from "../axiosClient";
import type { NotificationDTO } from "./NotificationSocketService";

const API_BASE_URL = "/notifications";

const NotificationService = {
  getByUser(userId: number) {
    return axiosClient.get<NotificationDTO[]>(`${API_BASE_URL}/user/${userId}`);
  },

  countUnread(userId: number) {
    return axiosClient.get<number>(
      `${API_BASE_URL}/user/${userId}/unread-count`,
    );
  },

  markAsRead(notificationId: number) {
    return axiosClient.put(`${API_BASE_URL}/${notificationId}/read`);
  },
};

export default NotificationService;
