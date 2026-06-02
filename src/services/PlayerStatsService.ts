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
  getTopScorers(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(
      `${API_BASE_URL}/top-scorers`,
      {
        params: { seasonId },
      },
    );
  }

  getBySeason(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(API_BASE_URL, {
      params: { seasonId },
    });
  }

  getCards(seasonId: number) {
    return axiosClient.get<PlayerStatsResponse[]>(`${API_BASE_URL}/cards`, {
      params: { seasonId },
    });
  }
}

export default new PlayerStatsService();
