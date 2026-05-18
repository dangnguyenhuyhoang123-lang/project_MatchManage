import type { League } from "../LeagueModel";
import type { SeasonModel } from "../SeasonModel";
import type { TeamModel } from "../TeamModel";
import { MatchStatus } from "../enum";

export interface MatchResponse {
  id?: number;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  matchDate: string; // BE trả string
  league: League;
  season: SeasonModel;
  homeTeam: TeamModel;
  awayTeam: TeamModel;
}
