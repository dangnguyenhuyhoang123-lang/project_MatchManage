// src/service/StadiumService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/stadiums";

class StadiumService {
  // Gọi API lấy stadiums.
  getAllStadiums(search?: string) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        search: search?.trim() || undefined,
      },
    });
  }

  // Gọi API lấy stadium by id.
  getStadiumById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/${id}`);
  }

  // Gọi API tạo stadium.
  addStadium(stadium: any) {
    return axiosClient.post(API_BASE_URL, stadium);
  }

  // Gọi API cập nhật stadium.
  updateStadium(id: number, stadium: any) {
    return axiosClient.put(`${API_BASE_URL}/${id}`, stadium);
  }

  // Gọi API xóa stadium.
  deleteStadium(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new StadiumService();
