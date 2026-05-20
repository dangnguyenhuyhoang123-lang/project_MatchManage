// src/service/MatchService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/matches";

class MatchService {
  getAllMatches(page: number, size: number, filters?: any) {
    return axiosClient.get(`${API_BASE_URL}/getAllMatches`, {
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
    return axiosClient.post(`${API_BASE_URL}/addMatch`, match);
  }

  updateMatch(id: number, match: any) {
    return axiosClient.put(`${API_BASE_URL}/updateMatch/${id}`, match);
  }

  deleteMatch(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteMatch/${id}`);
  }
}

export default new MatchService();
