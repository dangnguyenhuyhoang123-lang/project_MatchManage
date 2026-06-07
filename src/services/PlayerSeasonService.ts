import axiosClient from "./axiosClient";
import type { PlayerSeason } from "../model/PlayerSeason";

const API_BASE_URL = "/player-seasons";

class PlayerSeasonService {
  // Gọi API lấy player seasons.
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

  // Gọi API lấy player season by id.
  getPlayerSeasonById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getPlayerSeason/${id}`);
  }

  // Gọi API lấy player seasons by team.
  getPlayerSeasonsByTeam(teamId: number) {
    return axiosClient.get(`${API_BASE_URL}/getPlayerSeasonsByTeam/${teamId}`);
  }

  // Gọi API lấy player seasons by team season.
  getPlayerSeasonsByTeamSeason(teamSeasonId: number) {
    return axiosClient.get(
      `${API_BASE_URL}/getPlayerSeasonsByTeamSeason/${teamSeasonId}`,
    );
  }

  // Gọi API tạo player season.
  addPlayerSeason(data: PlayerSeason) {
    return axiosClient.post(`${API_BASE_URL}/PlayerSeason`, data);
  }

  // Gọi API cập nhật player season.
  updatePlayerSeason(id: number, data: PlayerSeason) {
    return axiosClient.put(`${API_BASE_URL}/updatePlayerSeason/${id}`, data);
  }

  // Gọi API xóa player season.
  deletePlayerSeason(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deletePlayerSeason/${id}`);
  }
}

export default new PlayerSeasonService();
