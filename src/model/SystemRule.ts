export type SystemRule = {
  id: number;
  ruleName: string;
  description: string | null;
  maxTeams: number | null;
  minAge: number | null;
  maxAge: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  winPoints: number | null;
  drawPoints: number | null;
  losePoints: number | null;
  allowedGoalTypes: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
  maxSubstitution: number | null;
  minRegistrationPlayers: number | null;
  maxForeignPlayers: number | null;
  rankingCriteriaOrder: string | null;
};
