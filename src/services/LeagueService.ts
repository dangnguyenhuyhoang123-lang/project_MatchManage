import axiosClient from "./axiosClient";
import { League } from "../model/LeagueModel";

const API_BASE_URL = "/leagues";

type SeasonResponse = {
  id?: number;
  year?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  leagueId?: number;
  leagueName?: string;
  systemRuleId?: number;
};

// Xử lý dữ liệu league.
const normalizeLeague = (raw: any) =>
  new League({
    id: raw?.id,
    name: raw?.name ?? "",
    country: raw?.country ?? "",
    scale: raw?.scale ?? "",
    status: raw?.status ?? "ACTIVE",
    logo: raw?.logo ?? null,
  });

// Xử lý dữ liệu payload.
const toPayload = (league: League) => ({
  name: league.name.trim(),
  country: league.country.trim(),
  scale: league.scale.trim(),
  status: league.status || "ACTIVE",
  logo: league.logo?.trim() || null,
});

class LeagueService {
  // Gọi API lấy leagues.
  getAllLeagues(page = 0, size = 10, search?: string) {
    return axiosClient.get(`${API_BASE_URL}/getAllLeagues`, {
      params: {
        page,
        size,
        search: search?.trim() || undefined,
      },
    });
  }

  // Gọi API lấy leagues normalized.
  async getAllLeaguesNormalized(page = 0, size = 10, search?: string) {
    const response = await this.getAllLeagues(page, size, search);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizeLeague)
        : [],
    };
  }

  // Gọi API lấy league by id.
  async getLeagueById(id: number) {
    const response = await axiosClient.get(`${API_BASE_URL}/getLeague/${id}`);
    return normalizeLeague(response.data);
  }

  // Gọi API lấy seasons by league.
  async getSeasonsByLeague(id: number): Promise<SeasonResponse[]> {
    const response = await axiosClient.get(
      `${API_BASE_URL}/getLeagueSeasons/${id}/seasons`,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  // Gọi API tạo league.
  async addLeague(league: League) {
    return axiosClient.post(`${API_BASE_URL}/addLeague`, toPayload(league));
  }

  // Gọi API cập nhật league.
  async updateLeague(id: number, league: League) {
    return axiosClient.put(`${API_BASE_URL}/updateLeague/${id}`, toPayload(league));
  }

  // Gọi API xóa league.
  deleteLeague(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteLeague/${id}`);
  }
}

export default new LeagueService();
