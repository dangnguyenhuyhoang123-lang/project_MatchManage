import axiosClient from "./axiosClient";

const API_BASE_URL = "/player-stats";

export type PlayerStatsResponse = {
  id: number;
  playerId: number;
  playerName: string;
  teamId?: number | null;
  teamName?: string | null;
  seasonId: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
};

class PlayerStatsService {
  // Gọi API lấy top scorers.
  getTopScorers(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(
      `${API_BASE_URL}/top-scorers`,
      {
        params: { seasonId },
      },
    );
  }

  // Gọi API lấy by season.
  getBySeason(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(API_BASE_URL, {
      params: { seasonId },
    });
  }

  // Gọi API lấy cards.
  getCards(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(`${API_BASE_URL}/cards`, {
      params: { seasonId },
    });
  }
}

export default new PlayerStatsService();
