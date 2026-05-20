// src/service/StandingService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/standings";

class StandingService {
  getAllStandings(seasonId?: number) {
    return axiosClient.get(`${API_BASE_URL}/getStandingBySeason`, {
      params: {
        seasonId: seasonId || undefined,
      },
    });
  }

  getStandingById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getStanding/${id}`);
  }
}

export default new StandingService();
