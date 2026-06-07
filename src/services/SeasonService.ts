// src/service/SeasonService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/seasons";

export type ScheduleGenerateRequest = {
  firstMatchDate: string;
  daysBetweenRounds?: number;
};

class SeasonService {
  // Gọi API lấy seasons.
  getAllSeasons(page = 0, size = 10, leagueId?: number) {
    return axiosClient.get(`${API_BASE_URL}/getAllSeasons`, {
      params: {
        page,
        size,
        leagueId: leagueId || undefined,
      },
    });
  }

  // Gọi API lấy season by id.
  getSeasonById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getSeason/${id}`);
  }

  // Gọi API lấy teams by season.
  getTeamsBySeason(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getSeasonTeams/${id}`);
  }

  // Gọi API tạo season.
  addSeason(season: any) {
    return axiosClient.post(`${API_BASE_URL}/addSeason`, season);
  }

  // Gọi API cập nhật season.
  updateSeason(id: number, season: any) {
    return axiosClient.put(`${API_BASE_URL}/updateSeason/${id}`, season);
  }

  // Gọi API xóa season.
  deleteSeason(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteSeason/${id}`);
  }

  // Xử lý dữ liệu generate schedule.
  generateSchedule(seasonId: number, payload: ScheduleGenerateRequest) {
    return axiosClient.post(
      `${API_BASE_URL}/${seasonId}/generate-schedule`,
      payload,
    );
  }
}

export default new SeasonService();
