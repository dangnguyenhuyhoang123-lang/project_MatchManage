export interface SeasonTeam {
  id?: number;
  seasonId?: number;
  seasonName?: string;
  teamId?: number;
  teamName?: string;
  team?: {
    id?: number;
    name?: string;
    logo?: string | null;
    city?: string | null;
    stadiumName?: string | null;
    stadium?: string | null;
  } | null;
  season?: {
    id?: number;
    name?: string;
    year?: string;
  } | null;
  teamLogo?: string | null;
  city?: string;
  stadiumName?: string;
  registrationId?: number | null;
  joinedAt?: string | null;
  createdAt?: string | null;
  assignedDate?: string | null;
  notes?: string;
  status?: string;
}
