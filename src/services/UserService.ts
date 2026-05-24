import axiosClient from "./axiosClient";
import CurrentUser from "../utils/CurrentUser";

const API_BASE_URL = "/user-account";

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

  logout() {
    CurrentUser.clear();
  }
}

export default new UserService();
