// import type { League } from "../model/LeagueModel";
// import type { SeasonModel } from "../model/SeasonModel";
// import type { TeamModel } from "../model/TeamModel";
// import axiosClient from "./axiosClient";
import MatchService from "./MatchService";

export type MatchStatusType =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | string;

export type MatchFormValues = {
  id?: number;
  matchDate: string;
  status: MatchStatusType;
  homeScore: string;
  awayScore: string;
  homeTeamId: string;
  awayTeamId: string;
  leagueId: string;
  seasonId: string;
  roundId?: string;
};

export type MatchOptionItem = {
  id: string;
  label: string;
  subLabel?: string;
};

export type MatchAdminOptions = {
  teams: MatchOptionItem[];
  leagues: MatchOptionItem[];
  seasons: MatchOptionItem[];
};

export type AdminMatchFilterParams = {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  seasonId?: number;
  roundId?: number;
  teamId?: number;
};

export async function getAdminMatches(params?: AdminMatchFilterParams) {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;

  const res = await MatchService.getAllMatches(page, size, {
    status: params?.status,
    search: params?.search,
    seasonId: params?.seasonId,
    roundId: params?.roundId,
    teamId: params?.teamId,
  });

  return res.data;
}

export async function createAdminMatch(payload: unknown) {
  const res = await MatchService.addMatch(payload);
  return res.data;
}

export async function updateAdminMatch(id: number, payload: unknown) {
  const res = await MatchService.updateMatch(id, payload);
  return res.data;
}

export async function deleteAdminMatch(id: number) {
  await MatchService.deleteMatch(id);
}
