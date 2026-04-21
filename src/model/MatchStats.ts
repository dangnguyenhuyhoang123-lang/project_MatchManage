export class MatchStats {
  cornersAway: number = 0;
  cornersHome: number = 0;
  foulsAway: number = 0;
  foulsHome: number = 0;
  offsidesAway: number = 0;
  offsidesHome: number = 0;
  possessionAway: number = 0;
  possessionHome: number = 0;
  redCardsAway: number = 0;
  redCardsHome: number = 0;
  shotsAway: number = 0;
  shotsHome: number = 0;
  shotsOnTargetAway: number = 0;
  shotsOnTargetHome: number = 0;
  yellowCardsAway: number = 0;
  yellowCardsHome: number = 0;

  constructor(data?: Partial<MatchStats>) {
    Object.assign(this, data);
  }
}
