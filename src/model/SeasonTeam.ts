export interface SeasonTeam {
  id?: number;
  seasonId: number;
  seasonName?: string;
  teamId: number;
  teamName?: string;
  city?: string;
  stadiumName?: string;
  registrationId?: number | null;
  notes?: string;
  status: string;
}
