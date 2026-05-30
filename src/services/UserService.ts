import axiosClient from "./axiosClient";
import CurrentUser from "../utils/CurrentUser";
import type { AuthUser } from "../types/AuthUser";

const API_BASE_URL = "/user-account";

export type UpdateProfilePayload = {
  username: string;
  fullName: string;
  displayName: string;
  email: string;
  avatar?: string;
};

export type UpdateUserRolesPayload = {
  roles: string[];
  teamId?: number | null;
};

export type CreateUserPayload = {
  username: string;
  password: string;
  fullName: string;
  displayName: string;
  email: string;
  avatar?: string;
  status?: boolean;
  roles: string[];
  teamId?: number | null;
};

export type UpdateUserStatusPayload = {
  status: boolean;
};

function extractMessage(errorData: unknown, fallback: string) {
  if (typeof errorData === "string" && errorData.trim()) {
    return errorData;
  }

  if (
    errorData &&
    typeof errorData === "object" &&
    "message" in errorData &&
    typeof (errorData as { message?: unknown }).message === "string"
  ) {
    return (errorData as { message: string }).message;
  }

  return fallback;
}

class UserService {
  getAllUsers(page = 0, size = 10) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        page,
        size,
      },
    });
  }

  async getCurrentUser() {
    const response = await axiosClient.get<AuthUser>(`${API_BASE_URL}/me`);
    return response.data;
  }

  async updateCurrentUserProfile(payload: UpdateProfilePayload) {
    const endpoints = [
      { url: `${API_BASE_URL}/me`, method: "put" },
      { url: `${API_BASE_URL}/profile`, method: "put" },
      { url: `${API_BASE_URL}/me`, method: "patch" },
      { url: `${API_BASE_URL}/profile`, method: "patch" },
    ] as const;

    let lastErrorMessage = "Không thể cập nhật thông tin người dùng.";

    for (const endpoint of endpoints) {
      const response = await axiosClient.request<AuthUser>({
        method: endpoint.method,
        url: endpoint.url,
        data: payload,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const updatedUser = response.data || (await this.getCurrentUser());
        CurrentUser.setUser(updatedUser);
        return updatedUser;
      }

      const errorData = response.data as unknown;

      if (response.status !== 404) {
        lastErrorMessage = extractMessage(
          errorData,
          response.statusText || lastErrorMessage,
        );
      }
    }

    throw new Error(lastErrorMessage);
  }

  async login(username: string, password: string) {
    const response = await axiosClient.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });

    try {
      const currentUser = await this.getCurrentUser();
      CurrentUser.setUser(currentUser);

      return {
        ...response,
        data: currentUser,
      };
    } catch {
      if (response.data) {
        CurrentUser.setUser(response.data);
      }
    }

    return response;
  }

  register(user: unknown) {
    return axiosClient.post(`${API_BASE_URL}/register`, user);
  }

  createUser(payload: CreateUserPayload) {
    return axiosClient.post(`${API_BASE_URL}/createUser`, payload);
  }

  updateUserRoles(userId: number, payload: UpdateUserRolesPayload) {
    return axiosClient.put(`${API_BASE_URL}/${userId}/roles`, payload);
  }

  async updateUser(
    userId: number,
    payload: Partial<CreateUserPayload> | UpdateProfilePayload,
  ) {
    const response = await axiosClient.put<AuthUser>(
      `${API_BASE_URL}/${userId}/info`,
      payload,
    );

    if (response.data) {
      CurrentUser.setUser(response.data);
    }

    return response;
  }

  updateUserStatus(userId: number, payload: UpdateUserStatusPayload) {
    return axiosClient.put(`${API_BASE_URL}/${userId}/status`, payload);
  }

  deleteUser(userId: number) {
    return axiosClient.delete(`${API_BASE_URL}/${userId}`);
  }

  logout() {
    CurrentUser.clear();
  }
}

const userService = new UserService();

export async function getCurrentUser() {
  return userService.getCurrentUser();
}

export async function updateCurrentUserProfile(payload: UpdateProfilePayload) {
  return userService.updateCurrentUserProfile(payload);
}

export default userService;
