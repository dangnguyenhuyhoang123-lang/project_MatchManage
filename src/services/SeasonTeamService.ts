import axiosClient from "./axiosClient";
import type { SeasonTeam } from "../model/SeasonTeam";

const API_BASE_URL = "/season-teams";

class SeasonTeamService {
  getAllSeasonTeams(page = 0, size = 10, filters?: any) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        page,
        size,
        seasonId: filters?.seasonId || undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  getSeasonTeamById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/${id}`);
  }

  addSeasonTeam(data: SeasonTeam) {
    return axiosClient.post(API_BASE_URL, data);
  }

  updateSeasonTeam(id: number, data: SeasonTeam) {
    return axiosClient.put(`${API_BASE_URL}/${id}`, data);
  }

  deleteSeasonTeam(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SeasonTeamService();
