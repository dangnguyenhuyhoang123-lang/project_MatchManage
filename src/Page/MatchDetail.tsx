import { Link, useParams } from "react-router-dom";
import {
  getMatchById,
  getStatsMatch,
  getListEventMatch,
  getLineupByMatch,
} from "../services/MatchAPI";
import { MatchModel } from "../model/MatchModel";
import { useState, useEffect } from "react";
import { MatchStats } from "../model/MatchStats";
import { MatchEvent } from "../model/MatchEvents";
import { labelStats } from "../utils/labelMatchDetail/labelStats";
import { EventItem } from "../utils/labelMatchDetail/EventItem";
import { PlayerInLineup } from "../model/PlayerInLineup";
import { getTeamDetailPath } from "../utils/teamRoute";
import { AnimatedPanel } from "../components/AnimationPanel/AnimatedPanel";

type PlayerRender = PlayerInLineup & {
  x: number;
  y: number;
  isHome: boolean;
  animationDelay?: string;
  event?: string | null;
};

const StatRow = ({
  left,
  right,
  label,
}: {
  left: number;
  right: number;
  label: string;
}) => {
  const total = left + right;
  const leftPercent = total === 0 ? 50 : (left / total) * 100;

  return (
    <div className="mb-4 animate-match-detail-stat">
      <div className="flex justify-between text-sm mb-1">
        <span>{left}</span>
        <span className="text-gray-600">{label}</span>
        <span>{right}</span>
      </div>

      <div className="flex h-3 bg-gray-200 rounded overflow-hidden">
        <div
          className="bg-black origin-left animate-match-detail-bar-left"
          style={{ width: `${leftPercent}%` }}
        />
        <div
          className="bg-red-500 origin-right animate-match-detail-bar-right"
          style={{ width: `${100 - leftPercent}%` }}
        />
      </div>
    </div>
  );
};
/* ================== EVENT ICON ================== */
const EVENT_ICONS: Record<string, string> = {
  GOAL: "⚽",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
  SUBSTITUTION: "🔄",
  PENALTY: "⚽",
};

/* ================== TABS ================== */
const tabs = [
  { id: "event", label: "DIỄN BIẾN CHÍNH" },
  { id: "lineup", label: "ĐỘI HÌNH RA SÂN" },
  { id: "stats", label: "THỐNG KÊ" },
];

/* ================== MAP LINEUP (CORE) ================== */
const mapLineup = (
  players: PlayerInLineup[],
  formation: number[],
  isHome: boolean,
) => {
  const result: PlayerRender[] = [];

  const gk = players.find((p) => p.position === "GK");
  const others = players.filter((p) => p.position !== "GK");

  const topLimit = isHome ? 45 : 5;
  const bottomLimit = isHome ? 95 : 55;

  const rawHeight = bottomLimit - topLimit;
  const height = rawHeight * 1; //
  const offset = (rawHeight - height) / 2;

  // GK
  if (gk) {
    result.push({
      ...gk,
      x: 50,
      y: isHome ? bottomLimit : topLimit,
      isHome,
      animationDelay: "0ms",
    });
  }

  let index = 0;
  const totalLines = formation.length;

  formation.forEach((count, lineIndex) => {
    for (let i = 0; i < count; i++) {
      const p = others[index++];
      if (!p) continue;

      const x = ((i + 1) * 100) / (count + 1);

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
    }
  });

  return result;
};
/* ================== MERGE EVENT ================== */
const enrichWithEvents = (
  players: PlayerRender[],
  events: MatchEvent[],
): PlayerRender[] => {
  return players.map((p) => {
    const e = events.find((ev) => ev.playerName === p.playerName);

    return {
      ...p,
      event: e ? EVENT_ICONS[e.eventType] : null,
    };
  });
};
const LineupField = ({ players }: { players: PlayerRender[] }) => {
  return (
    <div className="relative w-full h-[900px] bg-green-600 rounded-xl overflow-hidden">
      {/* Center line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/30" />

      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute top-0 left-1/2 w-64 h-24 border border-white/30 -translate-x-1/2" />
      <div className="absolute bottom-0 left-1/2 w-64 h-24 border border-white/30 -translate-x-1/2" />
      {/* Players */}
      {players.map((p, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center animate-match-detail-player"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            animationDelay: p.animationDelay || "0ms",
          }}
        >
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white
              ${p.isHome ? "bg-blue-500" : "bg-red-500"}
            `}
          >
            {p.shirtNumber}
          </div>

          {/* Name */}
          {/* <span className="text-white text-xs mt-1 text-center w-20"> */}
          <span className="text-white text-xs mt-1 text-center w-20 truncate">
            {/* <span className="text-white text-[10px] mt-1 text-center w-20 truncate leading-tight"></span> */}
            {p.playerName}
          </span>

          {/* Event icon */}
          {p.event && (
            <div className="absolute -top-1 -right-1 text-[10px] bg-white text-black rounded-full w-5 h-5 flex items-center justify-center">
              {p.event}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
const detectFormation = (players: PlayerInLineup[]) => {
  const lines: Record<string, number> = {
    DEF: 0,
    MID: 0,
    ATT: 0,
  };

  players.forEach((p) => {
    if (["RB", "LB", "CB", "RCB", "LCB"].includes(p.position)) {
      lines.DEF++;
    } else if (["CDM", "CM", "RCM", "LCM"].includes(p.position)) {
      lines.MID++;
    } else if (["RW", "LW", "ST", "CF"].includes(p.position)) {
      lines.ATT++;
    }
  });

  return [lines.DEF, lines.MID, lines.ATT];
};
const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<MatchModel | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [listEventMatch, setListEventMatch] = useState<MatchEvent[]>([]);
  const [listPlayerInLineUp, setListPlayerInLineUp] = useState<
    PlayerInLineup[]
  >([]);

  const [selectedLabel, setSelectedLabel] = useState("stats");
  useEffect(() => {
    if (!id) return;

    Promise.all([
      getMatchById(Number(id)),
      getStatsMatch(Number(id)),
      getListEventMatch(Number(id)),
      getLineupByMatch(Number(id)),
    ]).then(([match, stats, events, lineup]) => {
      setMatch(match);
      setMatchStats(stats);
      setListEventMatch(events);
      setListPlayerInLineUp(lineup);
    });
  }, [id]);
  if (!match || !matchStats) {
    return <div className="text-center mt-10">Loading...</div>;
  }
  /* ===== FILTER STARTING ===== */
  const homePlayers = listPlayerInLineUp.filter(
    (p) => p.teamName === match.homeTeam?.name && p.isStarting,
  );

  const awayPlayers = listPlayerInLineUp.filter(
    (p) => p.teamName === match.awayTeam?.name && p.isStarting,
  );

  const homeFormation = detectFormation(homePlayers);
  const awayFormation = detectFormation(awayPlayers);

  const homeMapped = mapLineup(homePlayers, homeFormation, true);
  const awayMapped = mapLineup(awayPlayers, awayFormation, false);
  const finalPlayers = enrichWithEvents(
    [...homeMapped, ...awayMapped],
    listEventMatch,
  );
  const groupByLine = (players: PlayerInLineup[]) => {
    return {
      DEF: players.filter((p) =>
        ["RB", "LB", "CB", "RCB", "LCB"].includes(p.position),
      ),
      MID: players.filter((p) =>
        ["CDM", "CM", "RCM", "LCM"].includes(p.position),
      ),
      ATT: players.filter((p) => ["RW", "LW", "ST", "CF"].includes(p.position)),
    };
  };
  const handleButtonOnclickLabel = (id: string) => {
    setSelectedLabel(id);
  };
  const safe = (value?: number) => value ?? 0;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      {/* HEADER */}
      <div className="bg-white shadow rounded-xl p-6 max-w-5xl mx-auto">
        {/* League + Status */}
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{match.league?.name}</span>
          <span>{match.status}</span>
        </div>

        {/* Teams + Score */}
        <div className="grid grid-cols-3 items-center text-center">
          {/* Home */}
          <div className="flex flex-col items-center">
            <Link
              to={getTeamDetailPath(match.homeTeam)}
              className="flex flex-col items-center hover:text-green-600"
            >
              <img
                src={match.homeTeam?.logo || "/default.png"}
                className="w-12 h-12 mb-2"
              />
              <p>{match.homeTeam?.name}</p>
            </Link>
          </div>

          {/* Score */}
          <div className="text-4xl font-bold flex justify-center items-center gap-4">
            <span>{match.homeScore}</span>
            <span className="text-gray-400">-</span>
            <span>{match.awayScore}</span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center">
            <Link
              to={getTeamDetailPath(match.awayTeam)}
              className="flex flex-col items-center hover:text-green-600"
            >
              <img
                src={match.awayTeam?.logo || "/default.png"}
                className="w-12 h-12 mb-2"
              />
              <p>{match.awayTeam?.name}</p>
            </Link>
          </div>
        </div>

        {/* Date */}
        <p className="text-center text-gray-500 mt-3">
          {new Date(match.matchDate).toLocaleString()}
        </p>

        {/* EVENTS (mock) */}
        <div className="grid grid-cols-3 mt-6 text-sm text-gray-600">
          <div className="text-left space-y-1">
            {listEventMatch.map((e, index) => {
              if (e.teamName === match.homeTeam?.name) {
                return (
                  <p key={index}>
                    {e.eventType !== "SUBSTITUTION" && (
                      <span>
                        {EVENT_ICONS[e.eventType] || "•"} {e.description}
                        {e.eventType === "PENALTY" && " (P)"}
                      </span>
                    )}
                  </p>
                );
              }
              return null;
            })}
          </div>

          <div className="flex flex-col items-center gap-2"></div>

          <div className="text-right space-y-1">
            {listEventMatch.map((e, index) => {
              if (e.teamName === match.awayTeam?.name) {
                return (
                  <p key={index}>
                    {EVENT_ICONS[e.eventType]}
                    {e.description}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* TABS */}

      <div className="flex justify-around mt-6 border-b text-sm max-w-5xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative overflow-hidden rounded-t-xl px-4 pb-3 pt-2 border-b-2 transition-all duration-300 ${
              tab.id === selectedLabel
                ? "border-black font-semibold text-black"
                : "border-transparent text-gray-400 hover:text-black hover:bg-white/60"
            }`}
            onClick={() => handleButtonOnclickLabel(tab.id)}
          >
            <span
              className={`absolute inset-x bottom-0 h-0.5 rounded-full bg-black transition-all duration-300 ${
                tab.id === selectedLabel
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50"
              }`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow mt-6 max-w-5xl mx-auto">
        {selectedLabel === "event" && (
          <AnimatedPanel panelKey="event">
            <div className="bg-white rounded-xl shadow mt-6 max-w-5xl mx-auto p-4">
              {listEventMatch.map((e, index) => (
                <EventItem
                  key={index}
                  event={e}
                  homeTeam={match.homeTeam?.name}
                />
              ))}
            </div>
          </AnimatedPanel>
        )}

        {selectedLabel === "lineup" && (
          <AnimatedPanel panelKey="lineup">
            <div className="bg-white p-4 rounded-xl shadow mt-6 max-w-5xl mx-auto animate-match-detail-lineup-shell">
              <LineupField players={finalPlayers} />
            </div>
          </AnimatedPanel>
        )}

        {selectedLabel === "stats" && (
          <AnimatedPanel panelKey="stats">
            {labelStats(matchStats, safe, StatRow)}
          </AnimatedPanel>
        )}
      </div>
    </div>
  );
};

export default MatchDetail;
