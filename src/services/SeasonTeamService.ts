import axios from "axios";
import type { SeasonTeam } from "../model/SeasonTeam";

const API_BASE_URL = "http://localhost:8080/api/season-teams";

class SeasonTeamService {
  getAllSeasonTeams(page = 0, size = 10, filters?: any) {
    return axios.get(API_BASE_URL, {
      params: {
        page,
        size,
        seasonId: filters?.seasonId || undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  getSeasonTeamById(id: number) {
    return axios.get(`${API_BASE_URL}/${id}`);
  }

  addSeasonTeam(data: SeasonTeam) {
    return axios.post(API_BASE_URL, data);
  }

  updateSeasonTeam(id: number, data: SeasonTeam) {
    return axios.put(`${API_BASE_URL}/${id}`, data);
  }

  deleteSeasonTeam(id: number) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SeasonTeamService();
