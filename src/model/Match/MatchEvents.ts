export interface MatchEvent {
  id: number;
  matchId: number;
  minute: number;
  extraMinute?: number | null;
  eventOrder?: number | null;
  eventType: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";
  goalType?: string | null;
  teamId: number;
  teamName: string;
  teamLogo?: string | null;
  playerId?: number | null;
  playerName?: string | null;
  playerInId?: number | null;
  playerInName?: string | null;
  assistPlayerId?: number | null;
  assistPlayerName?: string | null;
  note?: string | null;
}

export type EventType = "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";

export type GoalType = "NORMAL" | "PENALTY" | "OWN_GOAL";

export interface MatchEventUpsertRequest {
  minute: number;
  extraMinute: number | null;
  eventOrder: number | null;

  eventType: EventType;
  goalType: GoalType | null;

  teamId: number;

  playerId: number | null;
  playerInId: number | null;
  assistPlayerId: number | null;

  note: string | null;
}
