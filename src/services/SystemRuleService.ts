import axiosClient from "./axiosClient";

const API_BASE_URL = "/system-rules";

export type SystemRule = {
  id: number;
  ruleName: string;
  description: string | null;

  maxTeams: number | null;
  minAge: number | null;
  maxAge: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  minRegistrationPlayers?: number | null;

  winPoints: number | null;
  drawPoints: number | null;
  losePoints: number | null;

  allowedGoalTypes: string | null;
  status: "ACTIVE" | "INACTIVE" | string;

  maxSubstitution: number | null;
  minCoaches: number | null;
  maxCoaches: number | null;
  maxForeignPlayers: number | null;

  maxForeignPlayersOnField: number | null;
  maxGoalMinute: number | null;

  rankingCriteriaOrder: string | null;
};

export type SystemRulePayload = {
  ruleName: string;
  description: string | null;

  maxTeams: number | null;
  minAge: number | null;
  maxAge: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  minRegistrationPlayers?: number | null;

  winPoints: number | null;
  drawPoints: number | null;
  losePoints: number | null;

  allowedGoalTypes: string | null;
  status: "ACTIVE" | "INACTIVE";

  maxSubstitution: number | null;
  minCoaches: number | null;
  maxCoaches: number | null;
  maxForeignPlayers: number | null;

  maxForeignPlayersOnField: number | null;
  maxGoalMinute: number | null;

  rankingCriteriaOrder: string | null;
};

class SystemRuleService {
  // Gọi API lấy all.
  getAll(page = 0, size = 10) {
    return axiosClient.get(API_BASE_URL, {
      params: { page, size },
    });
  }

  // Gọi API lấy no paging.
  getAllNoPaging() {
    return axiosClient.get<SystemRule[]>(`${API_BASE_URL}/all`);
  }

  // Gọi API lấy by id.
  getById(id: number) {
    return axiosClient.get<SystemRule>(`${API_BASE_URL}/${id}`);
  }

  // Gọi API lấy team by id.
  getTeamById(id: number) {
    return axiosClient.get<SystemRule>(`${API_BASE_URL}/${id}`);
  }

  // Gọi API tạo create.
  create(payload: SystemRulePayload) {
    return axiosClient.post<SystemRule>(API_BASE_URL, payload);
  }

  // Gọi API cập nhật update.
  update(id: number, payload: SystemRulePayload) {
    return axiosClient.put<SystemRule>(`${API_BASE_URL}/${id}`, payload);
  }

  // Gọi API xóa delete.
  delete(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SystemRuleService();
