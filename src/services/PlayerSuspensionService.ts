import axiosClient from "./axiosClient";

const API_BASE_URL = "/player-suspensions";

export type PlayerSuspensionResponse = {
  id: number;
  playerId: number;
  playerName: string;
  seasonId: number;
  sourceMatchId?: number | null;
  suspendedMatchId?: number | null;
  reason: "RED_CARD" | "TWO_YELLOWS" | string;
  served: boolean;
};

class PlayerSuspensionService {
  // Gọi API lấy by season.
  getBySeason(seasonId: number) {
    return axiosClient.get<PlayerSuspensionResponse[]>(API_BASE_URL, {
      params: { seasonId },
    });
  }

  // Gọi API lấy active by match.
  getActiveByMatch(matchId: number) {
    return axiosClient.get<PlayerSuspensionResponse[]>(
      `${API_BASE_URL}/match/${matchId}/active`,
    );
  }
}

export default new PlayerSuspensionService();
