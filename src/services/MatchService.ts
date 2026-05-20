// src/service/MatchService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/matches";

class MatchService {
  getAllMatches(page: number, size: number, filters?: any) {
    return axios.get(`${API_BASE_URL}/getAllMatches`, {
      params: {
        page,
        size,
        status:
          filters?.status !== "Tất cả trạng thái" ? filters?.status : undefined,
        search: filters?.search?.trim() || undefined,
        seasonId: filters?.seasonId || undefined,
        roundId: filters?.roundId || undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  addMatch(match: any) {
    return axios.post(`${API_BASE_URL}/addMatch`, match);
  }

  updateMatch(id: number, match: any) {
    return axios.put(`${API_BASE_URL}/updateMatch/${id}`, match);
  }

  deleteMatch(id: number) {
    return axios.delete(`${API_BASE_URL}/deleteMatch/${id}`);
  }
}

export default new MatchService();
