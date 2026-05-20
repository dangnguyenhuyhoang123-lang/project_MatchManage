export interface PlayerPositionDTO {
  playerId: number;
  position: string;
  shirtNumber?: number;
  isStarting: boolean;
  lineupOrder: number;
  role?: string;
}

export interface MatchLineupSubmitDTO {
  matchId: number;
  teamId: number;
  formationName: string;
  description?: string;
  players: PlayerPositionDTO[];
}

export interface LineupPlayerResponse {
  lineupId: number;
  playerId: number;
  playerName: string;
  avatar?: string;
  shirtNumber: number;
  position: string;
  isStarting: boolean;
  lineupOrder: number;
  role?: string;
}

export interface TeamLineupResponse {
  tacticsId: number;
  matchId: number;
  teamId: number;
  teamName: string;
  formationName: string;
  description?: string;
  players: LineupPlayerResponse[];
}
