import { MatchModel } from "../model/Match/MatchModel";
import type { League } from "../model/LeagueModel";
import type { SeasonModel } from "../model/SeasonModel";
import type { TeamModel } from "../model/TeamModel";
import axiosClient from "./axiosClient";
import {
  MatchStatus,
  type MatchStatus as MatchStatusType,
} from "../model/enum";

const API_BASE_URL = "/matches";

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

const parseMatch = (item: any) =>
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
  });

const dedupeOptions = <T extends { id?: number; name?: string; year?: string }>(
  items: T[],
  getLabel: (item: T) => string,
  getSubLabel?: (item: T) => string | undefined,
) => {
  const seen = new Map<string, MatchOptionItem>();

  items.forEach((item) => {
    if (item.id == null) {
      return;
    }

    const key = String(item.id);

    if (!seen.has(key)) {
      seen.set(key, {
        id: key,
        label: getLabel(item),
        subLabel: getSubLabel?.(item),
      });
    }
  });

  return Array.from(seen.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
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

export const getAdminMatches = async (params?: {
  leagueName?: string;
  season?: string;
}) => {
  const response = await axiosClient.get(API_BASE_URL, {
    params,
  });

  const data = response.data;

  const matches = data.content.map(parseMatch);

  const teams = dedupeOptions<TeamModel>(
    matches.flatMap((match) => [match.homeTeam, match.awayTeam]),
    (team) => team.name,
    (team) => team.league?.name,
  );

  const leagues = dedupeOptions<League>(
    matches.map((match) => match.league),
    (league) => league.name,
    (league) => league.country,
  );

  const seasons = dedupeOptions<SeasonModel>(
    matches.map((match) => match.season),
    (season) => season.year,
  );

  return {
    matches,
    options: {
      teams,
      leagues,
      seasons,
    },
  };
};

const toMatchPayload = (values: MatchFormValues) => {
  const payload = {
    matchDate: new Date(values.matchDate).toISOString(),
    status: values.status,
    homeScore: toNullableNumber(values.homeScore),
    awayScore: toNullableNumber(values.awayScore),
    homeTeam: {
      id: Number(values.homeTeamId),
    },
    awayTeam: {
      id: Number(values.awayTeamId),
    },
    league: {
      id: Number(values.leagueId),
    },
    season: {
      id: Number(values.seasonId),
    },
  };

  return payload;
};

const toNullableNumber = (value: string) => {
  if (value.trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const normalizeSavedMatch = async (data: any) => {
  try {
    return parseMatch(data);
  } catch {
    const refreshed = await getAdminMatches();
    return refreshed.matches[0];
  }
};

export async function createAdminMatch(values: MatchFormValues) {
  const response = await axiosClient.post(API_BASE_URL, toMatchPayload(values));

  return normalizeSavedMatch(response.data);
}

export async function updateAdminMatch(values: MatchFormValues) {
  if (!values.id) {
    throw new Error("Khong xac dinh duoc tran dau can sua.");
  }

  const response = await axiosClient.put(
    `${API_BASE_URL}/${values.id}`,
    toMatchPayload(values),
  );

  return normalizeSavedMatch(response.data);
}

export async function deleteAdminMatch(matchId: number) {
  await axiosClient.delete(`${API_BASE_URL}/${matchId}`);
}

export const createEmptyMatchFormValues = (): MatchFormValues => ({
  matchDate: "",
  status: MatchStatus.SCHEDULED,
  homeScore: "",
  awayScore: "",
  homeTeamId: "",
  awayTeamId: "",
  leagueId: "",
  seasonId: "",
});
