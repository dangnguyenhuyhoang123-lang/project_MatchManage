import type { TeamModel } from "../model/TeamModel";

export const getTeamDetailPath = (team?: TeamModel | null) => {
  if (!team?.name) {
    return "/teams/unknown";
  }

  const searchParams = new URLSearchParams();

  if (team.logo) {
    searchParams.set("logo", team.logo);
  }

  if (team.league?.name) {
    searchParams.set("league", team.league.name);
  }

  if (team.stadium) {
    searchParams.set("stadium", team.stadium);
  }

  const queryString = searchParams.toString();

  return `/teams/${encodeURIComponent(team.name)}${queryString ? `?${queryString}` : ""}`;
};
