import { MatchModel } from "../model/Match/MatchModel";
import axiosClient from "./axiosClient";
import { my_request } from "./Request";
import { MatchStats } from "../model/MatchStats";
import type { MatchEvent } from "../model/MatchEvents";
import type { PlayerInLineup } from "../model/PlayerInLineup";

interface KetQuaInterface {
  ketQua: MatchModel[];
  tongSoTrang: number;
  tongSoTran: number;
}

export async function getListMatches(
  trangHienTai: number,
): Promise<KetQuaInterface> {
  const response = await axiosClient.get("/matches/getAllMatches", {
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
      }),
    );
  }

  return {
    ketQua: result,
    tongSoTran: response.data?.totalElements ?? result.length,
    tongSoTrang: response.data?.totalPages ?? 0,
  };
}

export async function getMatchById(matchID: number): Promise<MatchModel> {
  const url = `/matches/${matchID}`;

  const responseData = await my_request(url);

  const matchModel = new MatchModel({
    id: responseData.id,
    status: responseData.status,
    homeScore: responseData.homeScore,
    awayScore: responseData.awayScore,
    matchDate: new Date(responseData.matchDate),
    league: responseData.league,
    season: responseData.season,
    homeTeam: responseData.homeTeam,
    awayTeam: responseData.awayTeam,
  });

  return matchModel;
}

export async function getStatsMatch(matchID: number): Promise<MatchStats> {
  const url = `/matches/${matchID}/stats`;

  const responseData = await my_request(url);

  const stats = new MatchStats(responseData);

  return stats;
}

export async function getListEventMatch(
  matchID: number,
): Promise<MatchEvent[]> {
  const url = `/matches/${matchID}/list-event`;
  const result: MatchEvent[] = [];

  const responseData = await my_request(url);

  for (const item of responseData) {
    result.push(item);
  }

  return result;
}

export async function getLineupByMatch(
  matchID: number,
): Promise<PlayerInLineup[]> {
  const url = `/matches/${matchID}/lineup?sort=id,asc&size=40`;
  const result: PlayerInLineup[] = [];

  const response = await my_request(url);

  const responseData = response.content;

  for (const item of responseData) {
    result.push(item);
  }

  return result;
}
