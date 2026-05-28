export interface MatchLineup {
  id: number;
  playerId: number;
  playerName: string;
  avatar: string | null;
  position: string | null;
  shirtNumber: number | null;
  isStarting: boolean;
  lineupOrder: number | null;
  role: string | null;
}

export interface MatchTactics {
  id: number;
  matchId: number;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  formationName: string | null;
  description: string | null;
  lineups: MatchLineup[];
}

export interface MatchLineupsResponse {
  matchId: number;
  home: MatchTactics | null;
  away: MatchTactics | null;
}

export interface MatchLineupRequest {
  playerId: number;
  position: string;
  shirtNumber: number | null;
  isStarting: boolean;
  lineupOrder: number | null;
  role: string | null;
}

export interface MatchTacticsUpsertRequest {
  formationName: string;
  description: string | null;
  lineups: MatchLineupRequest[];
}
