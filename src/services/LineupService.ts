import axiosClient from "./axiosClient";
import type { MatchLineupSubmitDTO, TeamLineupResponse } from "../model/Lineup";

const API_BASE_URL = "/lineups";

class LineupService {
  getLineupsByMatch(matchId: number) {
    return axiosClient.get<TeamLineupResponse[]>(`${API_BASE_URL}/match/${matchId}`);
  }

  getLineupByMatchAndTeam(matchId: number, teamId: number) {
    return axiosClient.get<TeamLineupResponse>(
      `${API_BASE_URL}/match/${matchId}/team/${teamId}`,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      },
    );
  }

  getLineupByTactics(tacticsId: number) {
    return axiosClient.get<TeamLineupResponse>(
      `${API_BASE_URL}/tactics/${tacticsId}`,
    );
  }

  submitLineup(data: MatchLineupSubmitDTO) {
    return axiosClient.post<TeamLineupResponse>(`${API_BASE_URL}/submit`, data);
  }

  deleteLineup(matchId: number, teamId: number) {
    return axiosClient.delete(`${API_BASE_URL}/match/${matchId}/team/${teamId}`);
  }
}

export default new LineupService();
