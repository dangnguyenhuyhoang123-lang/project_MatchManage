import type { League } from "./LeagueModel";

export class TeamModel {
  id?: number;
  name: string;
  logo: string | null;
  establishedYear: number;
  city: string;
  region: string;
  owner: string;
  description: string;
  status: string;
  stadiumId: number | null;
  stadiumName: string | null;

  // Compat fields for existing pages still reading old shape.
  stadium: string;
  league: League | null;

  constructor(data: Partial<TeamModel> = {}) {
    this.id = data.id;
    this.name = data.name ?? "";
    this.logo = data.logo ?? null;
    this.establishedYear = data.establishedYear ?? 0;
    this.city = data.city ?? "";
    this.region = data.region ?? "";
    this.owner = data.owner ?? "";
    this.description = data.description ?? "";
    this.status = data.status ?? "ACTIVE";
    this.stadiumId = data.stadiumId ?? null;
    this.stadiumName = data.stadiumName ?? null;
    this.stadium = data.stadium ?? data.stadiumName ?? "";
    this.league = data.league ?? null;
  }
}
