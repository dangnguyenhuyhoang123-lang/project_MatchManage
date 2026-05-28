// src/service/SystemRuleService.ts
import axiosClient from "./axiosClient";
import type { SystemRule } from "../model/SystemRule";
const API_BASE_URL = "/system-rules";

export type SystemRulePayload = Omit<SystemRule, "id">;

class SystemRuleService {
  async getAll(
    page = 0,
    size = 10,
  ): Promise<{
    content: SystemRule[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await axiosClient.get(API_BASE_URL, {
      params: { page, size },
    });

    return response.data;
  }

  async getAllNoPaging(): Promise<SystemRule[]> {
    const response = await axiosClient.get<SystemRule[]>(`${API_BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<SystemRule> {
    const response = await axiosClient.get<SystemRule>(`${API_BASE_URL}/${id}`);
    return response.data;
  }

  async create(payload: SystemRulePayload): Promise<SystemRule> {
    const response = await axiosClient.post<SystemRule>(API_BASE_URL, payload);
    return response.data;
  }

  async update(id: number, payload: SystemRulePayload): Promise<SystemRule> {
    const response = await axiosClient.put<SystemRule>(
      `${API_BASE_URL}/${id}`,
      payload,
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new SystemRuleService();
