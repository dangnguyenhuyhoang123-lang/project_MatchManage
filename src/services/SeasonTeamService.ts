import axiosClient from "./axiosClient";
import type { SeasonTeam } from "../model/SeasonTeam";

const API_BASE_URL = "/season-teams";

class SeasonTeamService {
  // Gọi API lấy season teams.
  getAllSeasonTeams(page = 0, size = 10, filters?: any) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        page,
        size,
        seasonId: filters?.seasonId || undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  // Gọi API lấy đội tham gia theo mùa giải.
  getSeasonTeamsBySeason(seasonId: number) {
    return axiosClient.get(API_BASE_URL, {
      params: { seasonId },
      withCredentials: true,
    });
  }

  // Gọi API lấy season team by id.
  getSeasonTeamById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/${id}`);
  }

  // Gọi API tạo season team.
  addSeasonTeam(data: SeasonTeam) {
    return axiosClient.post(API_BASE_URL, data);
  }

  // Gọi API cập nhật season team.
  updateSeasonTeam(id: number, data: SeasonTeam) {
    return axiosClient.put(`${API_BASE_URL}/${id}`, data);
  }

  // Gọi API cập nhật trạng thái đội trong mùa giải.
  updateSeasonTeamStatus(id: number, status: "ACTIVE" | "INACTIVE") {
    return axiosClient.patch(`${API_BASE_URL}/${id}/status`, null, {
      params: { status },
      withCredentials: true,
    });
  }

  // Gọi API xóa season team.
  deleteSeasonTeam(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SeasonTeamService();
