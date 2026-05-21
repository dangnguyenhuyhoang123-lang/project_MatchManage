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

    if (response.data) {
      CurrentUser.setUser(response.data);
    }

    return response;
  }

  register(user: any) {
    return axiosClient.post(`${API_BASE_URL}/register`, user);
  }

  logout() {
    CurrentUser.clear();
  }
}

export default new UserService();
