export class RoundModel {
  id?: number;
  roundNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  maxMatches: number;
  status: string;
  notifyTeams: boolean;
  seasonId: number | null;
  seasonName: string | null;

  constructor(data: Partial<RoundModel> = {}) {
    this.id = data.id;
    this.roundNumber = data.roundNumber ?? 1;
    this.name = data.name ?? "";
    this.startDate = data.startDate ?? "";
    this.endDate = data.endDate ?? "";
    this.maxMatches = data.maxMatches ?? 0;
    this.status = data.status ?? "SCHEDULED";
    this.notifyTeams = data.notifyTeams ?? true;
    this.seasonId = data.seasonId ?? null;
    this.seasonName = data.seasonName ?? null;
  }
}
