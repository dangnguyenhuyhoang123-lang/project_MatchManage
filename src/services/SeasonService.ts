// src/service/SeasonService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/seasons";

export type ScheduleGenerateRequest = {
  firstMatchDate: string;
  daysBetweenRounds?: number;
};

class SeasonService {
  getAllSeasons(page = 0, size = 10, leagueId?: number) {
    return axiosClient.get(`${API_BASE_URL}/getAllSeasons`, {
      params: {
        page,
        size,
        leagueId: leagueId || undefined,
      },
    });
  }

  getSeasonById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getSeason/${id}`);
  }

  getTeamsBySeason(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getSeasonTeams/${id}`);
  }

  addSeason(season: any) {
    return axiosClient.post(`${API_BASE_URL}/addSeason`, season);
  }

  updateSeason(id: number, season: any) {
    return axiosClient.put(`${API_BASE_URL}/updateSeason/${id}`, season);
  }

  deleteSeason(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteSeason/${id}`);
  }

  generateSchedule(seasonId: number, payload: ScheduleGenerateRequest) {
    return axiosClient.post(
      `${API_BASE_URL}/${seasonId}/generate-schedule`,
      payload,
    );
  }
}

export default new SeasonService();
