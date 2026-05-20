import axios from "axios";
import type { PlayerSeason } from "../model/PlayerSeason";

const API_BASE_URL = "http://localhost:8080/api/player-seasons";

class PlayerSeasonService {
  getAllPlayerSeasons(page = 0, size = 10, filters?: any) {
    return axios.get(`${API_BASE_URL}/getPlayerSeasons`, {
      params: {
        page,
        size,
        seasonId: filters?.seasonId || undefined,
        teamId: filters?.teamId || undefined,
        teamSeasonId: filters?.teamSeasonId || undefined,
        playerId: filters?.playerId || undefined,
      },
    });
  }

  getPlayerSeasonById(id: number) {
    return axios.get(`${API_BASE_URL}/getPlayerSeason/${id}`);
  }

  getPlayerSeasonsByTeam(teamId: number) {
    return axios.get(`${API_BASE_URL}/getPlayerSeasonsByTeam/${teamId}`);
  }

  getPlayerSeasonsByTeamSeason(teamSeasonId: number) {
    return this.getAllPlayerSeasons(0, 300, { teamSeasonId });
  }

  addPlayerSeason(data: PlayerSeason) {
    return axios.post(`${API_BASE_URL}/PlayerSeason`, data);
  }

  updatePlayerSeason(id: number, data: PlayerSeason) {
    return axios.put(`${API_BASE_URL}/updatePlayerSeason/${id}`, data);
  }

  deletePlayerSeason(id: number) {
    return axios.delete(`${API_BASE_URL}/deletePlayerSeason/${id}`);
  }
}

export default new PlayerSeasonService();
