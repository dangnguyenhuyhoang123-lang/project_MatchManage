// src/service/SystemRuleService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/system-rules";

class SystemRuleService {
  getAllSystemRules(page = 0, size = 10) {
    return axios.get(API_BASE_URL, {
      params: {
        page,
        size,
      },
    });
  }

  getSystemRuleById(id: number) {
    return axios.get(`${API_BASE_URL}/${id}`);
  }

  addSystemRule(rule: any) {
    return axios.post(API_BASE_URL, rule);
  }

  updateSystemRule(id: number, rule: any) {
    return axios.put(`${API_BASE_URL}/${id}`, rule);
  }

  deleteSystemRule(id: number) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SystemRuleService();
