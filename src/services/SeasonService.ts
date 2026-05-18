// src/service/SeasonService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/seasons";

class SeasonService {
  getAllSeasons(page = 0, size = 10, leagueId?: number) {
    return axios.get(`${API_BASE_URL}/getAllSeasons`, {
      params: {
        page,
        size,
        leagueId: leagueId || undefined,
      },
    });
  }

  getSeasonById(id: number) {
    return axios.get(`${API_BASE_URL}/getSeasonById/${id}`);
  }

  getTeamsBySeason(id: number) {
    return axios.get(`${API_BASE_URL}/getSeasonTeams/${id}`);
  }

  addSeason(season: any) {
    return axios.post(`${API_BASE_URL}/addSeason`, season);
  }

  updateSeason(id: number, season: any) {
    return axios.put(`${API_BASE_URL}/updateSeason/${id}`, season);
  }

  deleteSeason(id: number) {
    return axios.delete(`${API_BASE_URL}/deleteSeason/${id}`);
  }
}

export default new SeasonService();
