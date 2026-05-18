// src/service/StadiumService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/stadiums";

class StadiumService {
  getAllStadiums(search?: string) {
    return axios.get(API_BASE_URL, {
      params: {
        search: search?.trim() || undefined,
      },
    });
  }

  getStadiumById(id: number) {
    return axios.get(`${API_BASE_URL}/${id}`);
  }

  addStadium(stadium: any) {
    return axios.post(API_BASE_URL, stadium);
  }

  updateStadium(id: number, stadium: any) {
    return axios.put(`${API_BASE_URL}/${id}`, stadium);
  }

  deleteStadium(id: number) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new StadiumService();
