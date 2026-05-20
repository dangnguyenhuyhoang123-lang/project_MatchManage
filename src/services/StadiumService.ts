// src/service/StadiumService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/stadiums";

class StadiumService {
  getAllStadiums(search?: string) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        search: search?.trim() || undefined,
      },
    });
  }

  getStadiumById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/${id}`);
  }

  addStadium(stadium: any) {
    return axiosClient.post(API_BASE_URL, stadium);
  }

  updateStadium(id: number, stadium: any) {
    return axiosClient.put(`${API_BASE_URL}/${id}`, stadium);
  }

  deleteStadium(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new StadiumService();
