import axiosClient from "./axiosClient";
import type { MatchLineupSubmitDTO, TeamLineupResponse } from "../model/Lineup";

const API_BASE_URL = "/matches";

class LineupService {
  // Gọi API lấy lineups by match.
  getLineupsByMatch(matchId: number) {
    return axiosClient.get(`${API_BASE_URL}/${matchId}/lineups`);
  }

  // Gọi API lấy lineup by match and team.
  getLineupByMatchAndTeam(matchId: number, teamId: number) {
    return axiosClient.get<TeamLineupResponse>(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/lineup`,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      },
    );
  }

  // Gọi API lấy match tactics.
  getMatchTactics(matchId: number) {
    return axiosClient.get<TeamLineupResponse[]>(
      `${API_BASE_URL}/${matchId}/tactics`,
    );
  }

  // Gọi API tạo lineup.
  submitLineup(matchId: number, teamId: number, data: MatchLineupSubmitDTO) {
    return axiosClient.put<TeamLineupResponse>(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/lineup`,
      data,
    );
  }

  // submitLineup(data: MatchLineupSubmitDTO) {
  //   return axiosClient.put<TeamLineupResponse>(`${API_BASE_URL}/submit`, data);
  // }

  deleteLineup(matchId: number, teamId: number) {
    return axiosClient.delete(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/lineup`,
    );
  }
}

export default new LineupService();
