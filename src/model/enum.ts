export const MatchStatus = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  FINISHED: "FINISHED",
  POSTPONED: "POSTPONED",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const EventType = {
  GOAL: "GOAL",
  YELLOW_CARD: "YELLOW_CARD",
  RED_CARD: "RED_CARD",
  SUBSTITUTION: "SUBSTITUTION",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
