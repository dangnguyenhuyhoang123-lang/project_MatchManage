import axios from "axios";
import { Player } from "../model/Player";

const API_BASE_URL = "http://localhost:8080/api/player";

type PlayerFilters = {
  position?: string;
  status?: string;
  teamId?: number | string;
};

const normalizePlayer = (raw: any) =>
  new Player({
    id: raw?.id,
    name: raw?.name,
    idCode: raw?.idCode ?? null,
    dateOfBirth: raw?.dateOfBirth,
    position: raw?.position,
    detailPosition: raw?.detailPosition ?? null,
    shirtNumber: raw?.shirtNumber ?? raw?.number ?? 0,
    nationality: raw?.nationality ?? "Việt Nam",
    height: raw?.height ?? 170,
    weight: raw?.weight ?? 65,
    status: raw?.status ?? "ACTIVE",
    avatar: raw?.avatar ?? null,
    teamId: raw?.teamId ?? null,
    teamName: raw?.teamName ?? null,
  });

const toPayload = (player: Player) => ({
  id: player.id,
  name: player.name.trim(),
  idCode: player.idCode?.trim() || null,
  dateOfBirth: player.dateOfBirth || null,
  position: player.position || null,
  detailPosition: player.detailPosition?.trim() || null,
  shirtNumber: Number(player.shirtNumber) || 0,
  nationality: player.nationality.trim(),
  height: Number(player.height) || 0,
  weight: Number(player.weight) || 0,
  status: player.status || "ACTIVE",
  avatar: player.avatar?.trim() || null,
  teamId: player.teamId ?? null,
});

class PlayerService {
  getAllPlayers(page: number, size: number, filters?: PlayerFilters) {
    return axios.get(`${API_BASE_URL}/getAllPlayers`, {
      params: {
        page,
        size,
        position:
          filters?.position && filters.position !== "Tất cả vị trí"
            ? filters.position
            : undefined,
        status:
          filters?.status && filters.status !== "Tất cả trạng thái"
            ? filters.status
            : undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  async getAllPlayersNormalized(page: number, size: number, filters?: PlayerFilters) {
    const response = await this.getAllPlayers(page, size, filters);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizePlayer)
        : [],
    };
  }

  async getPlayerById(id: number) {
    const response = await axios.post(`${API_BASE_URL}/getPlayer/${id}`, id);
    return normalizePlayer(response.data);
  }

  async addPlayer(player: Player) {
    return axios.post(`${API_BASE_URL}/addPlayer`, toPayload(player));
  }

  async updatePlayer(id: number, player: Player) {
    return axios.put(`${API_BASE_URL}/updatePlayer/${id}`, toPayload(player));
  }

  deletePlayer(id: number) {
    return axios.delete(`${API_BASE_URL}/deletePlayer/${id}`);
  }
}

export default new PlayerService();
