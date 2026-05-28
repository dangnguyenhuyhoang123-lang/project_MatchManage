import axiosClient from "./axiosClient";
import CurrentUser from "../utils/CurrentUser";

const API_BASE_URL = "/user-account";

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
  phone: string;
  status?: boolean;
  roles: string[];
  teamId?: number | null;
};

export type UpdateUserStatusPayload = {
  status: boolean;
};
class UserService {
  getAllUsers(page = 0, size = 10) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        page,
        size,
      },
    });
  }

  getCurrentUser() {
    return axiosClient.get(`${API_BASE_URL}/me`);
  }

  async login(username: string, password: string) {
    const response = await axiosClient.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });

    try {
      const currentUserResponse = await this.getCurrentUser();
      const currentUser = currentUserResponse.data || response.data;

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

  updateUser(userId: number, payload: any) {
    return axiosClient.put(`${API_BASE_URL}/${userId}/info`, payload);
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

export default new UserService();
