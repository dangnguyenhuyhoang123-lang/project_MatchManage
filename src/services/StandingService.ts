// src/service/StandingService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/standings";

class StandingService {
  getAllStandings(seasonId?: number) {
    return axios.get(`${API_BASE_URL}/getStandingBySeason`, {
      params: {
        seasonId: seasonId || undefined,
      },
    });
  }

  getStandingById(id: number) {
    return axios.get(`${API_BASE_URL}/getStanding/${id}`);
  }
}

export default new StandingService();
