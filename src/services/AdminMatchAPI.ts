import { MatchModel } from "../model/Match/MatchModel";
// import type { League } from "../model/LeagueModel";
// import type { SeasonModel } from "../model/SeasonModel";
// import type { TeamModel } from "../model/TeamModel";
// import axiosClient from "./axiosClient";
import MatchService from "./MatchService";

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

// export async function getAdminMatches() {
//   const firstPage = await getListMatches(1);
//   const totalPages = Math.max(firstPage.tongSoTrang, 1);
//   const pageCalls =
//     totalPages > 1
//       ? Array.from({ length: totalPages - 1 }, (_, index) =>
//           getListMatches(index + 2),
//         )
//       : [];
//   const remainingPages = await Promise.all(pageCalls);
//   const matches = [firstPage, ...remainingPages].flatMap((page) => page.ketQua);

//   const teams = dedupeOptions<TeamModel>(
//     matches.flatMap((match) => [match.homeTeam, match.awayTeam]),
//     (team) => team.name,
//     (team) => team.league?.name,
//   );

//   const leagues = dedupeOptions<League>(
//     matches.map((match) => match.league),
//     (league) => league.name,
//     (league) => league.country,
//   );

//   const seasons = dedupeOptions<SeasonModel>(
//     matches.map((match) => match.season),
//     (season) => season.year,
//   );

//   return {
//     matches,
//     options: {
//       teams,
//       leagues,
//       seasons,
//     } satisfies MatchAdminOptions,
//   };
// }

export async function getAdminMatches(params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  seasonId?: number;
  roundId?: number;
  teamId?: number;
}) {
  const res = await MatchService.getAllMatches({
    page: params?.page ?? 0,
    size: params?.size ?? 20,
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
