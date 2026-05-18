import axios from "axios";
import { RoundModel } from "../model/RoundModel";

const API_BASE_URL = "http://localhost:8080/api/rounds";

const normalizeRound = (raw: any) =>
  new RoundModel({
    id: raw?.id,
    roundNumber: raw?.roundNumber ?? 1,
    name: raw?.name ?? "",
    startDate: raw?.startDate ?? "",
    endDate: raw?.endDate ?? "",
    maxMatches: raw?.maxMatches ?? 0,
    status: raw?.status ?? "SCHEDULED",
    notifyTeams: raw?.notifyTeams ?? true,
    seasonId: raw?.seasonId ?? null,
    seasonName: raw?.seasonName ?? null,
  });

const toPayload = (round: RoundModel) => ({
  roundNumber: Number(round.roundNumber) || 1,
  name: round.name.trim(),
  startDate: round.startDate || null,
  endDate: round.endDate || null,
  maxMatches: Number(round.maxMatches) || 0,
  status: round.status || "SCHEDULED",
  notifyTeams: Boolean(round.notifyTeams),
  seasonId: round.seasonId ?? null,
});

class RoundService {
  getAllRounds(page = 0, size = 10, seasonId?: number) {
    return axios.get(`${API_BASE_URL}/getAllRoundBySeason`, {
      params: {
        page,
        size,
        seasonId: seasonId || undefined,
      },
    });
  }

  async getAllRoundsNormalized(page = 0, size = 10, seasonId?: number) {
    const response = await this.getAllRounds(page, size, seasonId);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizeRound)
        : [],
    };
  }

  async getRoundById(id: number) {
    const response = await axios.get(`${API_BASE_URL}/getRound/${id}`);
    return normalizeRound(response.data);
  }

  async addRound(round: RoundModel) {
    return axios.post(`${API_BASE_URL}/addRound`, toPayload(round));
  }

  async updateRound(id: number, round: RoundModel) {
    return axios.put(`${API_BASE_URL}/updateRound/${id}`, toPayload(round));
  }

  deleteRound(id: number) {
    return axios.delete(`${API_BASE_URL}/deleteRound/${id}`);
  }
}

export default new RoundService();
