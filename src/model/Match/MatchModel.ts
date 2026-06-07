import type { League } from "../LeagueModel";
import type { SeasonModel } from "../SeasonModel";
import type { TeamModel } from "../TeamModel";
import { MatchStatus } from "../enum";
export class MatchModel {
  readonly id?: number;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  matchDate: Date;
  league?: League;
  season?: SeasonModel;
  homeTeam: TeamModel;
  awayTeam: TeamModel;
  predictedHomeScore?: number | null;
  predictedAwayScore?: number | null;
  manOfTheMatchPlayerId?: number | null;
  manOfTheMatchPlayerName?: string | null;

  constructor({
    id,
    status = MatchStatus.SCHEDULED,
    homeScore,
    awayScore,
    matchDate,
    league,
    season,
    homeTeam,
    awayTeam,
    predictedHomeScore,
    predictedAwayScore,
    manOfTheMatchPlayerId,
    manOfTheMatchPlayerName,
  }: {
    id?: number;
    status?: MatchStatus;
    homeScore?: number;
    awayScore?: number;
    matchDate?: Date | string;
    league?: League;
    season?: SeasonModel;
    homeTeam: TeamModel;
    awayTeam: TeamModel;
    predictedHomeScore?: number | null;
    predictedAwayScore?: number | null;
    manOfTheMatchPlayerId?: number | null;
    manOfTheMatchPlayerName?: string | null;
  }) {
    if (homeTeam?.id === awayTeam?.id) {
      throw new Error("Home team and away team cannot be the same");
    }

    if (status === MatchStatus.FINISHED) {
      if (homeScore == null || awayScore == null) {
        throw new Error("Finished match must have scores");
      }
    }

    this.id = id;
    this.status = status;
    this.homeScore = homeScore;
    this.awayScore = awayScore;
    this.matchDate = matchDate ? new Date(matchDate) : new Date();
    this.league = league;
    this.season = season;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.predictedHomeScore = predictedHomeScore;
    this.predictedAwayScore = predictedAwayScore;
    this.manOfTheMatchPlayerId = manOfTheMatchPlayerId;
    this.manOfTheMatchPlayerName = manOfTheMatchPlayerName;
  }

  // Lấy winner.
  getWinner(): TeamModel | null {
    if (this.homeScore == null || this.awayScore == null) return null;
    if (this.homeScore > this.awayScore) return this.homeTeam;
    if (this.awayScore > this.homeScore) return this.awayTeam;
    return null;
  }
}
