import { Player } from "../model/Player";
import axiosClient from "./axiosClient";

const API_BASE_URL = "/player";

type PlayerFilters = {
  position?: string;
  status?: string;
  teamId?: number | string;
};

export type PlayerSearchResponse = {
  playerId: number;
  playerName: string;
  teamId?: number | null;
  teamName?: string | null;
  seasonId?: number | null;
  playerType: "DOMESTIC" | "FOREIGN" | string;
  nationality?: string | null;
  totalGoals: number;
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
    return axiosClient.get(`${API_BASE_URL}/getAllPlayers`, {
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

  async getAllPlayersNormalized(
    page: number,
    size: number,
    filters?: PlayerFilters,
  ) {
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
    const response = await axiosClient.get(`${API_BASE_URL}/getPlayer/${id}`);
    return normalizePlayer(response.data);
  }

  getPlayersByTeam(teamId: number, page = 0, size = 10) {
    return axiosClient.get(`${API_BASE_URL}/getPlayersByTeam/${teamId}`, {
      params: { page, size },
    });
  }

  async getPlayersByTeamNormalized(teamId: number, page = 0, size = 10) {
    const response = await this.getPlayersByTeam(teamId, page, size);
    const data = response.data;

    return {
      ...data,
      content: Array.isArray(data?.content)
        ? data.content.map(normalizePlayer)
        : [],
    };
  }

  async addPlayer(player: Player) {
    return axiosClient.post(`${API_BASE_URL}/addPlayer`, toPayload(player));
  }

  async updatePlayer(id: number, player: Player) {
    return axiosClient.put(
      `${API_BASE_URL}/updatePlayer/${id}`,
      toPayload(player),
    );
  }

  deletePlayer(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deletePlayer/${id}`);
  }

  searchPlayers(params?: {
    seasonId?: number;
    teamId?: number;
    keyword?: string;
    playerType?: string;
  }) {
    return axiosClient.get<PlayerSearchResponse[]>(`${API_BASE_URL}/search`, {
      params: {
        seasonId: params?.seasonId || undefined,
        teamId: params?.teamId || undefined,
        keyword: params?.keyword?.trim() || undefined,
        playerType: params?.playerType || undefined,
      },
    });
  }
}

export default new PlayerService();
