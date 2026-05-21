import axiosClient from "./axiosClient";
import type { PlayerSeason } from "../model/PlayerSeason";

const API_BASE_URL = "/player-seasons";

class PlayerSeasonService {
  getAllPlayerSeasons(page = 0, size = 10, filters?: any) {
    return axiosClient.get(`${API_BASE_URL}/getPlayerSeasons`, {
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
    return axiosClient.get(`${API_BASE_URL}/getPlayerSeason/${id}`);
  }

  getPlayerSeasonsByTeam(teamId: number) {
    return axiosClient.get(`${API_BASE_URL}/getPlayerSeasonsByTeam/${teamId}`);
  }

  getPlayerSeasonsByTeamSeason(teamSeasonId: number) {
    return axiosClient.get(
      `${API_BASE_URL}/getPlayerSeasonsByTeamSeason/${teamSeasonId}`,
    );
  }

  addPlayerSeason(data: PlayerSeason) {
    return axiosClient.post(`${API_BASE_URL}/PlayerSeason`, data);
  }

  updatePlayerSeason(id: number, data: PlayerSeason) {
    return axiosClient.put(`${API_BASE_URL}/updatePlayerSeason/${id}`, data);
  }

  deletePlayerSeason(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deletePlayerSeason/${id}`);
  }
}

export default new PlayerSeasonService();
