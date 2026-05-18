import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/coaches";

class CoachService {
  getAllCoaches(page = 0, size = 10, filters?: any) {
    return axios.get(`${API_BASE_URL}/getCoaches`, {
      params: {
        page,
        size,
        search: filters?.search?.trim() || undefined,
        status:
          filters?.status && filters.status !== "Tất cả trạng thái"
            ? filters.status
            : undefined,
      },
    });
  }

  getCoachById(id: number) {
    return axios.get(`${API_BASE_URL}/getCoach/${id}`);
  }

  addCoach(coach: any) {
    return axios.post(`${API_BASE_URL}/addCoach`, coach);
  }

  updateCoach(id: number, coach: any) {
    return axios.put(`${API_BASE_URL}/updateCoach/${id}`, coach);
  }

  deleteCoach(id: number) {
    return axios.delete(`${API_BASE_URL}/deleteCoach/${id}`);
  }
}

export default new CoachService();
