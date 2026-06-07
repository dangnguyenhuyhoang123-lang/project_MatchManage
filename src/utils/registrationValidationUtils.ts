type RuleLike = {
  minPlayers?: number | null;
  maxPlayers?: number | null;
  minRegistrationPlayers?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  minCoaches?: number | null;
  maxCoaches?: number | null;
};

type PlayerLike = {
  id?: number;
  fullName?: string;
  name?: string;
  birthDay?: string | Date | null;
  birthday?: string | Date | null;
  birthDate?: string | Date | null;
  dateOfBirth?: string | Date | null;
  idCode?: string | null;
};

export type CoachLike = {
  id?: number;
  fullName?: string;
  name?: string;
  idCode?: string | null;
};

export const getPersonName = (
  person?: { fullName?: string; name?: string } | null,
): string => person?.fullName || person?.name || "Không xác định";

export const calculateAge = (
  birthDate?: string | Date | null,
): number | null => {
  if (!birthDate) return null;

  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

export const getPlayerBirthDate = (
  player: PlayerLike,
): string | Date | null | undefined =>
  player.birthDay ?? player.birthDate ?? player.dateOfBirth ?? player.birthday;

export const isPlayerAgeValid = (
  player: PlayerLike,
  rule?: RuleLike | null,
): boolean => {
  const minAge = rule?.minAge;
  const maxAge = rule?.maxAge;

  if (minAge == null && maxAge == null) return true;

  const age = calculateAge(getPlayerBirthDate(player));

  if (age == null) return false;
  if (minAge != null && age < minAge) return false;
  if (maxAge != null && age > maxAge) return false;

  return true;
};

export const getPlayerCountError = (
  playerCount: number,
  rule?: RuleLike | null,
): string | null => {
  const minPlayers = rule?.minRegistrationPlayers ?? rule?.minPlayers;
  const maxPlayers = rule?.maxPlayers;

  if (minPlayers != null && playerCount < minPlayers) {
    return `Số cầu thủ tối thiểu là ${minPlayers}`;
  }

  if (maxPlayers != null && playerCount > maxPlayers) {
    return `Số cầu thủ tối đa là ${maxPlayers}`;
  }

  return null;
};

export const getCoachCountError = (
  coachCount: number,
  rule?: RuleLike | null,
): string | null => {
  const minCoaches = rule?.minCoaches;
  const maxCoaches = rule?.maxCoaches;

  if (minCoaches != null && coachCount < minCoaches) {
    return `Số HLV tối thiểu là ${minCoaches}`;
  }

  if (maxCoaches != null && coachCount > maxCoaches) {
    return `Số HLV tối đa là ${maxCoaches}`;
  }

  return null;
};

export const hasMissingIdCode = (
  items: Array<{ idCode?: string | null }>,
): boolean => items.some((item) => !item.idCode || !item.idCode.trim());

export const getInvalidAgePlayerNames = (
  players: PlayerLike[],
  rule?: RuleLike | null,
): string[] => {
  return players
    .filter((player) => !isPlayerAgeValid(player, rule))
    .map(getPersonName);
};
