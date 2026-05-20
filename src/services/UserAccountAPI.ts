import type { User } from "../utils/AuthContext";
import axiosClient from "./axiosClient";

const API_BASE_URL = "/user-account";

export type UpdateProfilePayload = {
  username: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
};

export async function getCurrentUser() {
  const response = await axiosClient.get<User>(`${API_BASE_URL}/me`);

  return response.data;
}

export async function updateCurrentUserProfile(payload: UpdateProfilePayload) {
  const endpoints = [
    { url: `${API_BASE_URL}/me`, method: "put" },
    { url: `${API_BASE_URL}/profile`, method: "put" },
    { url: `${API_BASE_URL}/me`, method: "patch" },
    { url: `${API_BASE_URL}/profile`, method: "patch" },
  ] as const;

  let lastErrorMessage = "Khong the cap nhat thong tin nguoi dung.";

  for (const endpoint of endpoints) {
    const response = await axiosClient.request<User>({
      method: endpoint.method,
      url: endpoint.url,
      data: payload,
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data || getCurrentUser();
    }

    const errorData = response.data as any;

    if (errorData?.message) {
      lastErrorMessage = errorData.message;
    } else if (response.status !== 404) {
      lastErrorMessage = response.statusText || lastErrorMessage;
    }
  }

  throw new Error(lastErrorMessage);
}
