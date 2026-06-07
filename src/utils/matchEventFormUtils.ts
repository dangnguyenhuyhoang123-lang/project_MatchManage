export const isGoalEvent = (eventType?: string | null): boolean =>
  eventType === "GOAL";

export const isCardEvent = (eventType?: string | null): boolean =>
  eventType === "YELLOW_CARD" || eventType === "RED_CARD";

export const isSubstitutionEvent = (eventType?: string | null): boolean =>
  eventType === "SUBSTITUTION";

export const isPenaltyGoal = (goalType?: string | null): boolean =>
  goalType === "PENALTY";

export const isOwnGoal = (goalType?: string | null): boolean =>
  goalType === "OWN_GOAL";

export const shouldShowGoalTypeField = (
  eventType?: string | null,
): boolean => isGoalEvent(eventType);

export const shouldShowAssistField = (
  eventType?: string | null,
  goalType?: string | null,
): boolean =>
  isGoalEvent(eventType) && !isPenaltyGoal(goalType) && !isOwnGoal(goalType);

export const shouldShowPlayerInField = (
  eventType?: string | null,
): boolean => isSubstitutionEvent(eventType);

export const shouldShowPlayerField = (
  eventType?: string | null,
): boolean =>
  isGoalEvent(eventType) ||
  isCardEvent(eventType) ||
  isSubstitutionEvent(eventType);
