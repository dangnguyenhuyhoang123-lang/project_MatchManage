import type { MatchEvent } from "../model/Match/MatchEvents";
import type {
  MatchLineup,
  MatchLineupsResponse,
} from "../model/Match/MatchLineup";

type CalculateLineupStateParams = {
  lineups?: MatchLineupsResponse | null;
  events?: MatchEvent[];
  teamId?: number | null;
  minute?: number | null;
  extraMinute?: number | null;
};

type LineupStateResult = {
  teamLineups: MatchLineup[];
  playingPlayers: MatchLineup[];
  benchPlayers: MatchLineup[];
};

const getTeamLineups = (
  lineups?: MatchLineupsResponse | null,
  teamId?: number | null,
): MatchLineup[] => {
  if (!lineups || !teamId) return [];

  if (lineups.home?.teamId === teamId) {
    return lineups.home.lineups ?? [];
  }

  if (lineups.away?.teamId === teamId) {
    return lineups.away.lineups ?? [];
  }

  return [];
};

const sortSubstitutionEvents = (events: MatchEvent[]): MatchEvent[] => {
  return [...events].sort((a, b) => {
    const minuteDiff = Number(a.minute ?? 0) - Number(b.minute ?? 0);
    if (minuteDiff !== 0) return minuteDiff;

    const extraDiff = Number(a.extraMinute ?? 0) - Number(b.extraMinute ?? 0);
    if (extraDiff !== 0) return extraDiff;

    return Number(a.eventOrder ?? a.id ?? 0) - Number(b.eventOrder ?? b.id ?? 0);
  });
};

const isBeforeOrAtCurrentEventTime = (
  event: MatchEvent,
  minute?: number | null,
  extraMinute?: number | null,
): boolean => {
  const eventMinute = Number(event.minute ?? 0);
  const currentMinute = Number(minute ?? 0);

  if (eventMinute < currentMinute) return true;
  if (eventMinute > currentMinute) return false;

  const eventExtraMinute = Number(event.extraMinute ?? 0);
  const currentExtraMinute = Number(extraMinute ?? 0);

  return eventExtraMinute <= currentExtraMinute;
};

const sortLineupPlayers = (a: MatchLineup, b: MatchLineup) => {
  const orderA = a.lineupOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.lineupOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999);
};

export const calculateCurrentLineupState = ({
  lineups,
  events = [],
  teamId,
  minute,
  extraMinute,
}: CalculateLineupStateParams): LineupStateResult => {
  const teamLineups = getTeamLineups(lineups, teamId);

  const playerMap = new Map<number, MatchLineup>();
  const playingIds = new Set<number>();
  const benchIds = new Set<number>();

  teamLineups.forEach((player) => {
    const playerId = Number(player.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) return;

    playerMap.set(playerId, player);

    if (player.isStarting) {
      playingIds.add(playerId);
    } else {
      benchIds.add(playerId);
    }
  });

  const substitutionEvents = sortSubstitutionEvents(
    events
      .filter((event) => {
        const playerOutId = Number(event.playerId);
        const playerInId = Number(event.playerInId);

        return (
          event.eventType === "SUBSTITUTION" &&
          Number(event.teamId) === Number(teamId) &&
          Number.isFinite(playerOutId) &&
          Number.isFinite(playerInId) &&
          playerOutId > 0 &&
          playerInId > 0
        );
      })
      .filter((event) =>
        isBeforeOrAtCurrentEventTime(event, minute, extraMinute),
      ),
  );

  substitutionEvents.forEach((event) => {
    const playerOutId = Number(event.playerId);
    const playerInId = Number(event.playerInId);

    if (!playingIds.has(playerOutId)) return;
    if (!benchIds.has(playerInId)) return;

    playingIds.delete(playerOutId);
    benchIds.add(playerOutId);

    benchIds.delete(playerInId);
    playingIds.add(playerInId);
  });

  return {
    teamLineups,
    playingPlayers: Array.from(playingIds)
      .map((playerId) => playerMap.get(playerId))
      .filter((player): player is MatchLineup => Boolean(player))
      .sort(sortLineupPlayers),
    benchPlayers: Array.from(benchIds)
      .map((playerId) => playerMap.get(playerId))
      .filter((player): player is MatchLineup => Boolean(player))
      .sort(sortLineupPlayers),
  };
};
