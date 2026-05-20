export interface PlayerSeason {
  id?: number;
  playerId: number;
  playerName?: string;
  teamId: number;
  teamName?: string;
  seasonId: number;
  seasonName?: string;
  teamSeasonId: number;
  shirtNumber: number;
  primaryPosition?: string;
  contractStart?: string;
  contractEnd?: string;
}
