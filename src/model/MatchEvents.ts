export class MatchEvent {
  id: number = 0;
  minute: number = 0;
  eventType: string = "";

  playerId?: number;
  playerName?: string;
  playerInId?: number;
  playerInName?: string;
  playerOutId?: number;
  playerOutName?: string;
  teamName?: string;
  description?: string;

  constructor(data?: Partial<MatchEvent>) {
    Object.assign(this, data);
  }
}
