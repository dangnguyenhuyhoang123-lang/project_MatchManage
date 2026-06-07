// src/service/StandingService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/standings";

class StandingService {
  // Gọi API lấy standings.
  getAllStandings(seasonId?: number) {
    return axiosClient.get(`${API_BASE_URL}/getStandingBySeason`, {
      params: {
        seasonId: seasonId || undefined,
      },
    });
  }

  // Gọi API lấy standing by id.
  getStandingById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getStanding/${id}`);
  }

  // Xử lý dữ liệu recalculate by season.
  recalculateBySeason(seasonId: number) {
    return axiosClient.post(`${API_BASE_URL}/recalculate`, null, {
      params: { seasonId },
    });
  }
}

export default new StandingService();
