import axiosClient from "./axiosClient";
import { TeamModel } from "../model/TeamModel";

const API_BASE_URL = "/teams";

type TeamFilters = {
  search?: string;
  city?: string;
  seasonId?: number | string;
};

// Xử lý dữ liệu team.
const normalizeTeam = (raw: any) =>
  new TeamModel({
    id: raw?.id,
    name: raw?.name,
    logo: raw?.logo ?? null,
    establishedYear: raw?.establishedYear ?? 0,
    city: raw?.city ?? "",
    region: raw?.region ?? "",
    owner: raw?.owner ?? "",
    description: raw?.description ?? "",
    status: raw?.status ?? "ACTIVE",
    stadiumId: raw?.stadiumId ?? null,
    stadiumName: raw?.stadiumName ?? null,
    stadium: raw?.stadiumName ?? "",
  });

// Xử lý dữ liệu payload.
const toPayload = (team: TeamModel) => ({
  name: team.name.trim(),
  logo: team.logo?.trim() || null,
  establishedYear: Number(team.establishedYear) || 0,
  city: team.city.trim(),
  region: team.region.trim(),
  owner: team.owner.trim(),
  description: team.description.trim(),
  status: team.status || "ACTIVE",
  stadiumId: team.stadiumId ?? null,
});

class TeamService {
  // Gọi API lấy teams.
  getAllTeams(page = 0, size = 10, filters?: TeamFilters) {
    return axiosClient.get(`${API_BASE_URL}/getAllTeams`, {
      params: {
        page,
        size,
        search: filters?.search?.trim() || undefined,
        city: filters?.city?.trim() || undefined,
        seasonId: filters?.seasonId || undefined,
      },
    });
  }

  // Gọi API lấy teams normalized.
  async getAllTeamsNormalized(page = 0, size = 10, filters?: TeamFilters) {
    const response = await this.getAllTeams(page, size, filters);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizeTeam)
        : [],
    };
  }

  // Gọi API lấy team by id.
  async getTeamById(id: number) {
    const response = await axiosClient.get(`${API_BASE_URL}/getTeam/${id}`);
    return normalizeTeam(response.data);
  }

  // Gọi API tạo team.
  async addTeam(team: TeamModel) {
    return axiosClient.post(`${API_BASE_URL}/addTeam`, toPayload(team));
  }

  // Gọi API cập nhật team.
  async updateTeam(id: number, team: TeamModel) {
    return axiosClient.put(`${API_BASE_URL}/updateTeam/${id}`, toPayload(team));
  }

  // Gọi API xóa team.
  deleteTeam(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteTeam/${id}`);
  }
}

export default new TeamService();
