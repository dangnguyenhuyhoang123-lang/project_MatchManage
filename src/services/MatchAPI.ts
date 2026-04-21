import { MatchModel } from "../model/MatchModel";
import { my_request } from "./Request";
import { MatchStats } from "../model/MatchStats";
import type { MatchEvent } from "../model/MatchEvents";
import type { PlayerInLineup } from "../model/PlayerInLineup";

interface KetQuaInterface {
  ketQua: MatchModel[];
  tongSoTrang: number;
  tongSoTran: number;
}
async function getMatch(url: string): Promise<KetQuaInterface> {
  const result: MatchModel[] = [];

  const response = await my_request(url);

  const tongSoTrang = response.totalPages;
  const tongSoTran = response.totalElements;

  // nếu API trả JSON array
  const responseData = response.content;

  for (const item of responseData) {
    const matchModel = new MatchModel({
      id: item.id,
      status: item.status,
      homeScore: item.homeScore,
      awayScore: item.awayScore,
      matchDate: new Date(item.matchDate),

      league: item.league,
      season: item.season,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
    });

    result.push(matchModel);
  }

  return { ketQua: result, tongSoTran: tongSoTran, tongSoTrang: tongSoTrang };
}

export async function getListMatches(
  trangHienTai: number,
): Promise<KetQuaInterface> {
  //   xac dinh endpoint
  const url: string = `http://localhost:8080/api/matches?size=3&page=${trangHienTai - 1}&sort=id,desc`;

  return getMatch(url);
}

export async function getMatchById(matchID: number): Promise<MatchModel> {
  const url = `http://localhost:8080/api/matches/${matchID}`;

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
  const url = `http://localhost:8080/api/matches/${matchID}/stats`;

  const responseData = await my_request(url);

  const stats = new MatchStats(responseData);

  return stats;
}

export async function getListEventMatch(
  matchID: number,
): Promise<MatchEvent[]> {
  const url = `http://localhost:8080/api/matches/${matchID}/list-event`;
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
  const url = `http://localhost:8080/api/matches/${matchID}/lineup?sort=id,asc&size=40`;
  const result: PlayerInLineup[] = [];

  const response = await my_request(url);

  const responseData = response.content;

  for (const item of responseData) {
    result.push(item);
  }

  return result;
}
