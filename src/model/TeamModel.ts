import type { League } from "./LeagueModel";

export class TeamModel {
  id?: number;
  name: string;
  logo: string;
  stadium: string;
  league: League;

  constructor({
    id,
    name = "",
    logo = "",
    stadium = "",
    league,
  }: {
    id?: number;
    name?: string;
    logo?: string;
    stadium?: string;
    league: League;
  }) {
    this.id = id;
    this.name = name;
    this.logo = logo;
    this.stadium = stadium;
    this.league = league;
  }
}
