import axios from "axios";
import type { MatchLineupSubmitDTO, TeamLineupResponse } from "../model/Lineup";

const API_BASE_URL = "http://localhost:8080/api/lineups";

class LineupService {
  getLineupsByMatch(matchId: number) {
    return axios.get<TeamLineupResponse[]>(`${API_BASE_URL}/match/${matchId}`);
  }

  getLineupByMatchAndTeam(matchId: number, teamId: number) {
    return axios.get<TeamLineupResponse>(
      `${API_BASE_URL}/match/${matchId}/team/${teamId}`,
    );
  }

  getLineupByTactics(tacticsId: number) {
    return axios.get<TeamLineupResponse>(
      `${API_BASE_URL}/tactics/${tacticsId}`,
    );
  }

  submitLineup(data: MatchLineupSubmitDTO) {
    return axios.post<TeamLineupResponse>(`${API_BASE_URL}/submit`, data);
  }

  deleteLineup(matchId: number, teamId: number) {
    return axios.delete(`${API_BASE_URL}/match/${matchId}/team/${teamId}`);
  }
}

export default new LineupService();
