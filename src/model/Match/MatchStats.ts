export interface MatchStats {
  id: number;
  matchId: number;
  teamId: number;
  teamName: string;
  teamLogo: string | null;

  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  totalPasses: number;
  passAccuracy: number;
}
