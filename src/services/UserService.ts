// src/service/UserService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/user-account";

class UserService {
  getAllUsers(page = 0, size = 10) {
    return axios.get(API_BASE_URL, {
      params: {
        page,
        size,
      },
      withCredentials: true,
    });
  }

  getCurrentUser() {
    return axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
    });
  }

  login(username: string, password: string) {
    return axios.post(
      `${API_BASE_URL}/login`,
      { username, password },
      { withCredentials: true },
    );
  }

  register(user: any) {
    return axios.post(`${API_BASE_URL}/register`, user, {
      withCredentials: true,
    });
  }
}

export default new UserService();
