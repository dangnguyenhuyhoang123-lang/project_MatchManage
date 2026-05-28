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

  winPoints: number | null;
  drawPoints: number | null;
  losePoints: number | null;

  allowedGoalTypes: string | null;
  status: "ACTIVE" | "INACTIVE" | string;

  maxSubstitution: number | null;
  minRegistrationPlayers: number | null;
  maxForeignPlayers: number | null;
};

export type SystemRulePayload = {
  ruleName: string;
  description: string | null;

  maxTeams: number | null;

  minAge: number | null;
  maxAge: number | null;

  minPlayers: number | null;
  maxPlayers: number | null;

  winPoints: number | null;
  drawPoints: number | null;
  losePoints: number | null;

  allowedGoalTypes: string | null;
  status: "ACTIVE" | "INACTIVE";

  maxSubstitution: number | null;
  minRegistrationPlayers: number | null;
  maxForeignPlayers: number | null;
};

class SystemRuleService {
  getAll(page = 0, size = 10) {
    return axiosClient.get(API_BASE_URL, {
      params: { page, size },
    });
  }

  getAllNoPaging() {
    return axiosClient.get<SystemRule[]>(`${API_BASE_URL}/all`);
  }

  getById(id: number) {
    return axiosClient.get<SystemRule>(`${API_BASE_URL}/${id}`);
  }

  create(payload: SystemRulePayload) {
    return axiosClient.post<SystemRule>(API_BASE_URL, payload);
  }

  update(id: number, payload: SystemRulePayload) {
    return axiosClient.put<SystemRule>(`${API_BASE_URL}/${id}`, payload);
  }

  delete(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SystemRuleService();
