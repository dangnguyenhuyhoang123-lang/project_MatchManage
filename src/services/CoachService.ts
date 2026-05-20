import axiosClient from "./axiosClient";
import type { Coach } from "../model/CoachModel";

const API_BASE_URL = "/coaches";

const normalizeCoach = (raw: any): Coach => ({
  id: raw?.id ?? raw?.coachId,
  name: raw?.name ?? raw?.coachName ?? "",
  nationality: raw?.nationality ?? "Việt Nam",
  idCode: raw?.idCode ?? raw?.license ?? "",
  avatar: raw?.avatar ?? raw?.image ?? null,
  birthDay: raw?.birthDay ?? raw?.birthday ?? raw?.dateOfBirth ?? "",
  description: raw?.description ?? raw?.role ?? "",
  status: raw?.status ?? "ACTIVE",
  teamId: raw?.teamId ?? raw?.team?.id ?? 0,
  teamName: raw?.teamName ?? raw?.team?.name ?? "",
});

class CoachService {
  getAllCoaches(page = 0, size = 10, filters?: any) {
    return axiosClient.get(`${API_BASE_URL}/getCoaches`, {
      params: {
        page,
        size,
        search: filters?.search?.trim() || undefined,
        status:
          filters?.status && filters.status !== "Tất cả trạng thái"
            ? filters.status
            : undefined,
      },
    });
  }
  getCoachesByTeamId(teamId: number, page = 0, size = 8) {
    return axiosClient.get(`${API_BASE_URL}/getCoachesByTeam/${teamId}`, {
      params: { page, size },
    });
  }

  async getCoachesByTeamNormalized(teamId: number, page = 0, size = 8) {
    const response = await this.getCoachesByTeamId(teamId, page, size);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizeCoach)
        : [],
    };
  }

  getCoachById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getCoach/${id}`);
  }

  addCoach(coach: any) {
    return axiosClient.post(`${API_BASE_URL}/addCoach`, coach);
  }

  updateCoach(id: number, coach: any) {
    return axiosClient.put(`${API_BASE_URL}/updateCoach/${id}`, coach);
  }

  deleteCoach(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteCoach/${id}`);
  }
}

export default new CoachService();
