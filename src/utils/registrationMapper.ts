export const mapSelectedIds = <T extends { id?: number }>(items: T[]): number[] =>
  items
    .map((item) => item.id)
    .filter((id): id is number => typeof id === "number");

export const mapRegistrationPlayers = <
  T extends {
    id?: number;
    shirtNumber?: number | string | null;
    number?: number | string | null;
    position?: string | null;
  },
>(
  players: T[],
) =>
  players
    .filter((player) => Number.isFinite(Number(player.id)))
    .map((player) => ({
      playerId: Number(player.id),
      shirtNumber: Number(player.shirtNumber ?? player.number ?? 0),
      position: player.position || "Cầu thủ",
    }));

export const mapRegistrationCoaches = <
  T extends {
    coachId?: number | string | null;
    role: string;
  },
>(
  coaches: T[],
) =>
  coaches
    .filter((coach) => coach.coachId != null)
    .map((coach) => ({
      coachId: Number(coach.coachId),
      role: coach.role,
    }));
