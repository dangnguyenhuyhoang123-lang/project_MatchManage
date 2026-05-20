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

const normalizeLeague = (raw: any) =>
  new League({
    id: raw?.id,
    name: raw?.name ?? "",
    country: raw?.country ?? "",
    scale: raw?.scale ?? "",
    status: raw?.status ?? "ACTIVE",
    logo: raw?.logo ?? null,
  });

const toPayload = (league: League) => ({
  name: league.name.trim(),
  country: league.country.trim(),
  scale: league.scale.trim(),
  status: league.status || "ACTIVE",
  logo: league.logo?.trim() || null,
});

class LeagueService {
  getAllLeagues(page = 0, size = 10, search?: string) {
    return axiosClient.get(`${API_BASE_URL}/getAllLeagues`, {
      params: {
        page,
        size,
        search: search?.trim() || undefined,
      },
    });
  }

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

  async getLeagueById(id: number) {
    const response = await axiosClient.get(`${API_BASE_URL}/getLeague/${id}`);
    return normalizeLeague(response.data);
  }

  async getSeasonsByLeague(id: number): Promise<SeasonResponse[]> {
    const response = await axiosClient.get(
      `${API_BASE_URL}/getLeagueSeasons/${id}/seasons`,
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async addLeague(league: League) {
    return axiosClient.post(`${API_BASE_URL}/addLeague`, toPayload(league));
  }

  async updateLeague(id: number, league: League) {
    return axiosClient.put(`${API_BASE_URL}/updateLeague/${id}`, toPayload(league));
  }

  deleteLeague(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteLeague/${id}`);
  }
}

export default new LeagueService();
