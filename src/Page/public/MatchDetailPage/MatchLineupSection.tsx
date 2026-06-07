import type { MatchEvent } from "../../../model/Match/MatchEvents";
import type { MatchLineup } from "../../../model/Match/MatchLineup";
import { getEventIconText } from "../../../utils/matchEventUtils";

export type MatchDetailPlayer = MatchLineup & {
  teamId?: number;
  teamName?: string;
};

type PlayerRender = MatchDetailPlayer & {
  x: number;
  y: number;
  isHome: boolean;
  animationDelay?: string;
  event?: string | null;
};

type MatchLineupSectionProps = {
  homeTeamName?: string;
  awayTeamName?: string;
  homePlayers: MatchDetailPlayer[];
  awayPlayers: MatchDetailPlayer[];
  events: MatchEvent[];
};

export default function MatchLineupSection({
  homeTeamName,
  awayTeamName,
  homePlayers,
  awayPlayers,
  events,
}: MatchLineupSectionProps) {
  if (homePlayers.length === 0 && awayPlayers.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-[#D8D4CE] mb-4">
          groups
        </span>
        <p className="text-[#707A6C] font-bold">
          Đội hình ra sân chưa được cập nhật.
        </p>
      </div>
    );
  }

  const homeFormation = detectFormation(homePlayers);
  const awayFormation = detectFormation(awayPlayers);
  const homeMapped = mapLineup(homePlayers, true);
  const awayMapped = mapLineup(awayPlayers, false);
  const finalPlayers = enrichWithEvents([...homeMapped, ...awayMapped], events);

  return (
    <div className="animate-match-detail-lineup-shell">
      <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto px-4">
        <div className="text-center flex-1">
          <h4 className="font-bold text-[#0D631B]">{homeTeamName}</h4>
          <p className="text-[10px] font-bold text-[#707A6C] uppercase">
            {homeFormation.join("-")}
          </p>
        </div>
        <div className="px-4 py-1 bg-[#F5F3EF] rounded-full text-xs font-bold text-[#707A6C]">
          VS
        </div>
        <div className="text-center flex-1">
          <h4 className="font-bold text-[#3A45A4]">{awayTeamName}</h4>
          <p className="text-[10px] font-bold text-[#707A6C] uppercase">
            {awayFormation.join("-")}
          </p>
        </div>
      </div>
      <LineupField players={finalPlayers} />
    </div>
  );
}

const getLineGroup = (
  position?: string | null,
): "GK" | "DEF" | "MID" | "ATT" | "OTHER" => {
  const value = (position ?? "").toUpperCase();

  if (["GK"].includes(value)) return "GK";

  if (["DF", "DEF", "RB", "LB", "CB", "RCB", "LCB"].includes(value)) {
    return "DEF";
  }

  if (
    [
      "MF",
      "MID",
      "CDM",
      "CM",
      "RCM",
      "LCM",
      "DM",
      "CAM",
      "LAM",
      "RAM",
      "LM",
      "RM",
      "LWB",
      "RWB",
    ].includes(value)
  ) {
    return "MID";
  }

  if (["FW", "ATT", "RW", "LW", "ST", "CF", "LS", "RS"].includes(value)) {
    return "ATT";
  }

  return "OTHER";
};

const sortByLineupOrder = (a: MatchDetailPlayer, b: MatchDetailPlayer) =>
  (a.lineupOrder ?? 0) - (b.lineupOrder ?? 0);

function mapLineup(players: MatchDetailPlayer[], isHome: boolean) {
  const result: PlayerRender[] = [];

  const gk = players.find((p) => getLineGroup(p.position) === "GK");

  const defenders = players
    .filter((p) => getLineGroup(p.position) === "DEF")
    .sort(sortByLineupOrder);

  const midfielders = players
    .filter((p) => getLineGroup(p.position) === "MID")
    .sort(sortByLineupOrder);

  const attackers = players
    .filter((p) => getLineGroup(p.position) === "ATT")
    .sort(sortByLineupOrder);

  const groupedLines = [defenders, midfielders, attackers].filter(
    (line) => line.length > 0,
  );

  const topLimit = isHome ? 50 : 10;
  const bottomLimit = isHome ? 100 : 65;

  const rawHeight = bottomLimit - topLimit;
  const height = rawHeight;
  const offset = (rawHeight - height) / 2;

  if (gk) {
    result.push({
      ...gk,
      x: 55,
      y: isHome ? bottomLimit : topLimit,
      isHome,
      animationDelay: "0ms",
    });
  }

  const totalLines = groupedLines.length;

  groupedLines.forEach((linePlayers, lineIndex) => {
    const count = linePlayers.length;

    linePlayers.forEach((p, i) => {
      const centerShiftX = 5.5;
      const rawX = ((i + 1) * 100) / (count + 1);
      const x = Math.min(92, Math.max(8, rawX + centerShiftX));

      const y = isHome
        ? bottomLimit - offset - ((lineIndex + 1) * height) / (totalLines + 1)
        : topLimit + offset + ((lineIndex + 1) * height) / (totalLines + 1);

      result.push({
        ...p,
        x,
        y,
        isHome,
        animationDelay: `${(lineIndex + i + 1) * 35}ms`,
      });
    });
  });

  return result;
}

function enrichWithEvents(
  players: PlayerRender[],
  events: MatchEvent[],
): PlayerRender[] {
  return players.map((p) => {
    const event = events.find(
      (ev) => ev.playerId === p.playerId || ev.playerName === p.playerName,
    );

    return {
      ...p,
      event: event ? getEventIconText(event.eventType) : null,
    };
  });
}

function detectFormation(players: MatchDetailPlayer[]) {
  const lines: Record<string, number> = {
    DEF: 0,
    MID: 0,
    ATT: 0,
  };

  players.forEach((p) => {
    const position = (p.position ?? "").toUpperCase();
    const group = getLineGroup(position);

    if (group === "DEF") {
      lines.DEF++;
    } else if (group === "MID") {
      lines.MID++;
    } else if (group === "ATT") {
      lines.ATT++;
    }
  });

  return [lines.DEF, lines.MID, lines.ATT].filter((count) => count > 0);
}

function LineupField({ players }: { players: PlayerRender[] }) {
  return (
    <div className="relative mx-auto w-full max-w-5xl h-[780px] md:h-[900px] lg:h-[980px] rounded-[32px] overflow-hidden border border-[#D8D4CE] bg-[#1a6e38] shadow-inner">
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.06)_50%,transparent_50%)] bg-[length:100%_120px]" />
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/50" />
      <div className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50" />
      <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
      <div className="absolute left-1/2 top-0 w-64 h-24 -translate-x-1/2 border-x-2 border-b-2 border-white/50 rounded-b-xl" />
      <div className="absolute left-1/2 bottom-0 w-64 h-24 -translate-x-1/2 border-x-2 border-t-2 border-white/50 rounded-t-xl" />
      <div className="absolute left-1/2 top-0 w-24 h-4 -translate-x-1/2 border-x-2 border-b-2 border-white/50" />
      <div className="absolute left-1/2 bottom-0 w-24 h-4 -translate-x-1/2 border-x-2 border-t-2 border-white/50" />

      {players.map((player) => (
        <div
          key={`${player.teamId}-${player.playerId}-${player.isHome ? "home" : "away"}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-match-detail-player"
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
            animationDelay: player.animationDelay,
          }}
        >
          <div
            className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center shadow-lg bg-white ${
              player.isHome ? "border-[#0D631B]" : "border-[#3A45A4]"
            }`}
          >
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.playerName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span
                className={`material-symbols-outlined ${
                  player.isHome ? "text-[#0D631B]" : "text-[#3A45A4]"
                }`}
              >
                person
              </span>
            )}

            {player.event && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-sm">
                {player.event}
              </span>
            )}
          </div>

          <div className="mt-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-center min-w-[72px] max-w-[110px]">
            <p className="text-[10px] font-black leading-tight truncate">
              {player.shirtNumber ? `${player.shirtNumber}. ` : ""}
              {player.playerName}
            </p>
            <p className="text-[9px] opacity-80 font-bold">{player.position}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
