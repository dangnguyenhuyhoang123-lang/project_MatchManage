// src/service/SystemRuleService.ts
import axiosClient from "./axiosClient";

const API_BASE_URL = "/system-rules";

class SystemRuleService {
  getAllSystemRules(page = 0, size = 10) {
    return axiosClient.get(API_BASE_URL, {
      params: {
        page,
        size,
      },
    });
  }

  getSystemRuleById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/${id}`);
  }

  addSystemRule(rule: any) {
    return axiosClient.post(API_BASE_URL, rule);
  }

  updateSystemRule(id: number, rule: any) {
    return axiosClient.put(`${API_BASE_URL}/${id}`, rule);
  }

  deleteSystemRule(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SystemRuleService();
