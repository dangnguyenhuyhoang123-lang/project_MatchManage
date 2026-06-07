// src/service/MatchService.ts
import axiosClient from "./axiosClient";
import type { MatchEvent } from "../model/Match/MatchEvents";
import type {
  MatchStats,
  MatchStatsUpsertRequest,
} from "../model/Match/MatchStats";
import type {
  MatchLineupsResponse,
  MatchTactics,
  MatchTacticsUpsertRequest,
} from "../model/Match/MatchLineup";
import { MatchModel } from "../model/Match/MatchModel";
import type { MatchEventUpsertRequest } from "../model/Match/MatchEvents";
// --- Types ---
const API_BASE_URL = "/matches";

interface KetQuaInterface {
  ketQua: MatchModel[];
  tongSoTrang: number;
  tongSoTran: number;
}

export type MatchTeamSeasonDTO = {
  matchId: number;
  teamId: number;
  seasonId: number;
  teamSeasonId: number;
};

export type ManOfTheMatchStatsResponse = {
  playerId: number;
  playerName: string;
  teamId?: number | null;
  teamName?: string | null;
  seasonId: number;
  awardCount: number;
};

class MatchService {
  // Gọi API lấy matches.
  getAllMatches(page: number, size: number, filters?: any) {
    return axiosClient.get(`${API_BASE_URL}/getAllMatches`, {
      params: {
        page,
        size,
        status:
          filters?.status !== "Tất cả trạng thái" ? filters?.status : undefined,
        search: filters?.search?.trim() || undefined,
        seasonId: filters?.seasonId || undefined,
        roundId: filters?.roundId || undefined,
        teamId: filters?.teamId || undefined,
      },
    });
  }

  // Gọi API tạo match.
  addMatch(match: any) {
    return axiosClient.post(`${API_BASE_URL}/addMatch`, match);
  }

  // Gọi API cập nhật match.
  updateMatch(id: number, match: any) {
    return axiosClient.put(`${API_BASE_URL}/updateMatch/${id}`, match);
  }
  async updateMatchStatus(
    matchId: number,
    status: "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED" | string,
  ): Promise<MatchModel> {
    const response = await axiosClient.patch(
      `${API_BASE_URL}/${matchId}/status`,
      { status },
    );

    const responseData = response.data;

    return new MatchModel({
      id: responseData.id,
      status: responseData.status,
      homeScore: responseData.homeScore,
      awayScore: responseData.awayScore,
      matchDate: new Date(responseData.matchDate),
      league: responseData.league,
      season: responseData.season,
      homeTeam: responseData.homeTeam,
      awayTeam: responseData.awayTeam,
      manOfTheMatchPlayerId: responseData.manOfTheMatchPlayerId,
      manOfTheMatchPlayerName: responseData.manOfTheMatchPlayerName,
    });
  }

  // Gọi API xóa match.
  deleteMatch(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteMatch/${id}`);
  }

  async createMatchEvent(
    matchId: number,
    payload: MatchEventUpsertRequest,
  ): Promise<MatchEvent> {
    const response = await axiosClient.post<MatchEvent>(
      `${API_BASE_URL}/${matchId}/events`,
      payload,
    );

    return response.data;
  }

  async updateMatchEvent(
    matchId: number,
    eventId: number,
    payload: MatchEventUpsertRequest,
  ): Promise<MatchEvent> {
    const response = await axiosClient.put<MatchEvent>(
      `${API_BASE_URL}/${matchId}/events/${eventId}`,
      payload,
    );

    return response.data;
  }

  // Gọi API xóa match event.
  async deleteMatchEvent(matchId: number, eventId: number): Promise<void> {
    await axiosClient.delete(`${API_BASE_URL}/${matchId}/events/${eventId}`);
  }

  // Gọi API lấy list event match.
  async getListEventMatch(matchID: number): Promise<MatchEvent[]> {
    const response = await axiosClient.get<MatchEvent[]>(
      `${API_BASE_URL}/${matchID}/events`,
    );

    return response.data;
  }

  // Gọi API lấy stats match.
  async getStatsMatch(matchID: number): Promise<MatchStats[]> {
    const response = await axiosClient.get<MatchStats[]>(
      `${API_BASE_URL}/${matchID}/stats`,
    );

    return response.data;
  }

  async upsertStatsMatch(
    matchID: number,
    payload: MatchStatsUpsertRequest[],
  ): Promise<MatchStats[]> {
    const response = await axiosClient.put<MatchStats[]>(
      `${API_BASE_URL}/${matchID}/stats`,
      payload,
    );

    return Array.isArray(response.data) ? response.data : [];
  }
  // Gọi API lấy match lineups.
  async getMatchLineups(matchId: number): Promise<MatchLineupsResponse> {
    const response = await axiosClient.get<MatchLineupsResponse>(
      `${API_BASE_URL}/${matchId}/lineups`,
    );

    return response.data;
  }

  // Gọi API lấy team lineup.
  async getTeamLineup(matchId: number, teamId: number): Promise<MatchTactics> {
    const response = await axiosClient.get<MatchTactics>(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/lineup`,
    );

    return response.data;
  }

  async upsertTeamLineup(
    matchId: number,
    teamId: number,
    payload: MatchTacticsUpsertRequest,
  ): Promise<MatchTactics> {
    const response = await axiosClient.put<MatchTactics>(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/lineup`,
      payload,
    );

    return response.data;
  }

  // Gọi API lấy match tactics.
  async getMatchTactics(matchId: number): Promise<MatchTactics[]> {
    const response = await axiosClient.get<MatchTactics[]>(
      `${API_BASE_URL}/${matchId}/tactics`,
    );

    return response.data;
  }

  // Gọi API lấy list matches.
  async getListMatches(trangHienTai: number): Promise<KetQuaInterface> {
    const response = await axiosClient.get(`${API_BASE_URL}/getAllMatches`, {
      params: {
        page: Math.max(trangHienTai - 1, 0),
        size: 3,
      },
    });
    const result: MatchModel[] = [];
    const responseData = response.data?.content ?? [];

    for (const item of responseData) {
      result.push(
        new MatchModel({
          id: item.id,
          status: item.status,
          homeScore: item.homeScore,
          awayScore: item.awayScore,
          matchDate: new Date(item.matchDate),
          league: item.league,
          season: item.season,
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          manOfTheMatchPlayerId: item.manOfTheMatchPlayerId,
          manOfTheMatchPlayerName: item.manOfTheMatchPlayerName,
        }),
      );
    }

    return {
      ketQua: result,
      tongSoTran: response.data?.totalElements ?? result.length,
      tongSoTrang: response.data?.totalPages ?? 0,
    };
  }

  // Gọi API lấy match by id.
  async getMatchById(matchID: number): Promise<MatchModel> {
    const response = await axiosClient.get(`${API_BASE_URL}/${matchID}`);

    const responseData = response.data;

    return new MatchModel({
      id: responseData.id,
      status: responseData.status,
      homeScore: responseData.homeScore,
      awayScore: responseData.awayScore,
      matchDate: new Date(responseData.matchDate),
      league: responseData.league,
      season: responseData.season,
      homeTeam: responseData.homeTeam,
      awayTeam: responseData.awayTeam,
      manOfTheMatchPlayerId: responseData.manOfTheMatchPlayerId,
      manOfTheMatchPlayerName: responseData.manOfTheMatchPlayerName,
    });
  }

  // Gọi API lấy team season by match and team.
  getTeamSeasonByMatchAndTeam(matchId: number, teamId: number) {
    return axiosClient.get<MatchTeamSeasonDTO>(
      `${API_BASE_URL}/${matchId}/teams/${teamId}/team-season`,
    );
  }

  predictMatch(matchId: number) {
    return axiosClient.post<MatchModel>(`${API_BASE_URL}/${matchId}/predict`);
  }

  // Gọi API cập nhật man of the match.
  updateManOfTheMatch(matchId: number, playerId: number) {
    return axiosClient.patch<MatchModel>(
      `${API_BASE_URL}/${matchId}/man-of-the-match/${playerId}`,
    );
  }

  // Gọi API lấy man of the match stats.
  getManOfTheMatchStats(seasonId: number) {
    return axiosClient.get<ManOfTheMatchStatsResponse[]>(
      `${API_BASE_URL}/man-of-the-match-stats`,
      {
        params: { seasonId },
      },
    );
  }
}

export default new MatchService();
