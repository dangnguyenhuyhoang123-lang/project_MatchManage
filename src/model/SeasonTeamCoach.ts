export interface SeasonTeamCoach {
  id?: number;
  seasonId: number;
  seasonName?: string;
  teamId: number;
  teamName?: string;
  coachId: number;
  coachName?: string;
  role: string;
  assignedDate?: string;
  endDate?: string;
  status: string;
}
