import { Link, useParams } from "react-router-dom";
import {
  getMatchById,
  getStatsMatch,
  getListEventMatch,
} from "../services/MatchAPI";
import LineupService from "../services/LineupService";
import type { TeamLineupResponse } from "../model/Lineup";
import type { TeamModel } from "../model/TeamModel";
import { MatchModel } from "../model/Match/MatchModel";
import { useState, useEffect } from "react";
import { MatchStats } from "../model/MatchStats";
import { MatchEvent } from "../model/MatchEvents";
import { labelStats } from "../utils/labelMatchDetail/labelStats";
import { PlayerInLineup } from "../model/PlayerInLineup";
import { getTeamDetailPath } from "../utils/teamRoute";
import { AnimatedPanel } from "../components/AnimationPanel/AnimatedPanel";

type MatchDetailPlayer = PlayerInLineup & {
  teamId?: number;
};

type PlayerRender = MatchDetailPlayer & {
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
    <div className="mb-6 animate-match-detail-stat">
      <div className="flex justify-between text-sm font-bold mb-2 text-[#1B1C1A]">
        <span className="text-[#0D631B]">{left}</span>
        <span className="text-[#707A6C] text-[10px] uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[#3A45A4]">{right}</span>
      </div>

      <div className="flex h-2 bg-[#ECE9E4] rounded-full overflow-hidden">
        <div
          className="bg-[#0D631B] origin-left animate-match-detail-bar-left transition-all duration-500"
          style={{ width: `${leftPercent}%` }}
        />
        <div
          className="bg-[#3A45A4] origin-right animate-match-detail-bar-right transition-all duration-500"
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
  { id: "event", label: "DIỄN BIẾN CHÍNH", icon: "sports_score" },
  { id: "lineup", label: "ĐỘI HÌNH RA SÂN", icon: "groups" },
  { id: "stats", label: "THỐNG KÊ", icon: "query_stats" },
];

const normalizeLineups = (
  lineups: TeamLineupResponse[],
): MatchDetailPlayer[] => {
  return lineups
    .flatMap((teamLineup) =>
      (teamLineup.players ?? []).map(
        (player) =>
          Object.assign(
            new PlayerInLineup({
              id: player.lineupId ?? player.playerId,
              playerName: player.playerName,
              shirtNumber: player.shirtNumber,
              position: player.position,
              teamName: teamLineup.teamName,
              avatar: player.avatar ?? "",
              isStarting: Boolean(player.isStarting),
              lineupOrder: player.lineupOrder ?? 0,
              role: player.role ?? null,
            }),
            { teamId: teamLineup.teamId },
          ) as MatchDetailPlayer,
      ),
    )
    .sort((a, b) => {
      if (a.teamId !== b.teamId) return (a.teamId ?? 0) - (b.teamId ?? 0);
      if (a.isStarting !== b.isStarting) return a.isStarting ? -1 : 1;
      return (a.lineupOrder ?? 0) - (b.lineupOrder ?? 0);
    });
};

const sortEventsByMinute = (events: MatchEvent[]) =>
  [...events].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

const isSameTeam = (player: MatchDetailPlayer, team?: TeamModel | null) => {
  if (!team) return false;

  if (player.teamId != null && team.id != null) {
    return player.teamId === team.id;
  }

  return player.teamName === team.name;
};

/* ================== MAP LINEUP (CORE) ================== */
const mapLineup = (
  players: MatchDetailPlayer[],
  formation: number[],
  isHome: boolean,
) => {
  const result: PlayerRender[] = [];

  const gk = players.find((p) => p.position === "GK");
  const others = players.filter((p) => p.position !== "GK");

  const topLimit = isHome ? 45 : 5;
  const bottomLimit = isHome ? 95 : 55;

  const rawHeight = bottomLimit - topLimit;
  const height = rawHeight * 1;
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
    <div className="relative w-full max-w-3xl mx-auto h-[800px] bg-[#439648] rounded-[24px] overflow-hidden border-[8px] border-[#377A3B] shadow-inner">
      {/* Grass pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,#fff_40px,#fff_80px)]" />

      {/* Center line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/60" />

      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />

      {/* Penalty areas */}
      <div className="absolute top-0 left-1/2 w-64 h-32 border-2 border-white/60 border-t-0 -translate-x-1/2" />
      <div className="absolute top-0 left-1/2 w-32 h-12 border-2 border-white/60 border-t-0 -translate-x-1/2" />

      <div className="absolute bottom-0 left-1/2 w-64 h-32 border-2 border-white/60 border-b-0 -translate-x-1/2" />
      <div className="absolute bottom-0 left-1/2 w-32 h-12 border-2 border-white/60 border-b-0 -translate-x-1/2" />

      {/* Penalty marks */}
      <div className="absolute top-24 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2" />
      <div className="absolute bottom-24 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2" />

      {/* Players */}
      {players.map((p, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center animate-match-detail-player transition-all hover:scale-110 cursor-pointer"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            animationDelay: p.animationDelay || "0ms",
          }}
        >
          {/* Avatar / Shirt */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 border-white shadow-md z-10
              ${p.isHome ? "bg-[#0D631B] text-white" : "bg-[#3A45A4] text-white"}
            `}
          >
            {p.shirtNumber}
          </div>

          {/* Name */}
          <span className="text-white text-[10px] font-bold mt-1.5 text-center w-24 px-1 py-0.5 rounded bg-black/40 backdrop-blur-sm truncate shadow-sm z-20">
            {p.playerName}
          </span>

          {/* Event icon */}
          {p.event && (
            <div className="absolute -top-2 -right-2 text-[10px] bg-white text-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-30 animate-bounce">
              {p.event}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const detectFormation = (players: MatchDetailPlayer[]) => {
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
    MatchDetailPlayer[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedLabel, setSelectedLabel] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchId = Number(id);

    if (!id || Number.isNaN(matchId)) {
      setMatch(null);
      setMatchStats(null);
      setListEventMatch([]);
      setListPlayerInLineUp([]);
      setError("Mã trận đấu không hợp lệ.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const matchData = await getMatchById(matchId);

        if (cancelled) return;

        setMatch(matchData);

        const [statsResult, eventsResult, lineupResult] =
          await Promise.allSettled([
            getStatsMatch(matchId),
            getListEventMatch(matchId),
            LineupService.getLineupsByMatch(matchId),
          ]);

        if (cancelled) return;

        setMatchStats(
          statsResult.status === "fulfilled"
            ? new MatchStats(statsResult.value)
            : new MatchStats(),
        );

        setListEventMatch(
          eventsResult.status === "fulfilled"
            ? sortEventsByMinute(eventsResult.value)
            : [],
        );

        setListPlayerInLineUp(
          lineupResult.status === "fulfilled"
            ? normalizeLineups(lineupResult.value.data ?? [])
            : [],
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Lỗi khi tải chi tiết trận đấu:", error);
        setMatch(null);
        setMatchStats(null);
        setListEventMatch([]);
        setListPlayerInLineUp([]);
        setError("Không thể tải dữ liệu chi tiết trận đấu.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0D631B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#707A6C] font-bold animate-pulse">
          Đang tải dữ liệu trận đấu...
        </p>
      </div>
    );
  }

  if (!match || !matchStats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
          sports_soccer
        </span>
        <h3 className="text-xl font-bold text-[#1B1C1A]">
          Không tìm thấy trận đấu
        </h3>
        <p className="text-[#707A6C] mt-2">
          {error ?? "Dữ liệu trận đấu không tồn tại hoặc đã bị xóa."}
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-[#0D631B] text-white rounded-full font-bold hover:bg-[#0a4a14] transition"
        >
          Trở về trang chủ
        </Link>
      </div>
    );
  }

  /* ===== FILTER STARTING ===== */
  const homePlayers = listPlayerInLineUp.filter(
    (p) => isSameTeam(p, match.homeTeam) && p.isStarting,
  );

  const awayPlayers = listPlayerInLineUp.filter(
    (p) => isSameTeam(p, match.awayTeam) && p.isStarting,
  );

  const homeFormation = detectFormation(homePlayers);
  const awayFormation = detectFormation(awayPlayers);

  const homeMapped = mapLineup(homePlayers, homeFormation, true);
  const awayMapped = mapLineup(awayPlayers, awayFormation, false);
  const finalPlayers = enrichWithEvents(
    [...homeMapped, ...awayMapped],
    listEventMatch,
  );

  const handleButtonOnclickLabel = (tabId: string) => {
    setSelectedLabel(tabId);
  };

  const safe = (value?: number) => value ?? 0;

  const isFinished =
    match.status === "FINISHED" ||
    (match.homeScore != null && match.awayScore != null);

  return (
    <div className="w-full bg-[#fbf9f5] min-h-screen pb-12">
      {/* Banner / Header Background */}
      <div className="h-48 md:h-64 bg-[#1B1C1A] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1B1C1A]"></div>
        <div className="z-10 text-center px-4">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            {match.league?.name || "Giải đấu"} •{" "}
            {match.season?.year || "Mùa giải"}
          </span>
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight font-headline">
            Chi tiết trận đấu
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 space-y-8">
        {/* MATCH SCORECARD */}
        <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgba(27,28,26,0.06)] border border-[#E4E2DE] p-6 md:p-10 overflow-hidden relative">
          {/* Header Status & Date */}
          <div className="flex flex-col items-center justify-center mb-8 relative">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isFinished ? "bg-[#ABF4AC80] text-[#07521D]" : "bg-yellow-100 text-yellow-800"}`}
            >
              {isFinished
                ? "ĐÃ KẾT THÚC"
                : match.status === "SCHEDULED"
                  ? "SẮP DIỄN RA"
                  : match.status}
            </span>
            <span className="text-[#707A6C] text-sm font-medium mt-3">
              {new Date(match.matchDate).toLocaleString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="flex justify-between items-center max-w-3xl mx-auto relative">
            {/* Home Team */}
            <div className="flex flex-col items-center w-1/3 group">
              <Link
                to={getTeamDetailPath(match.homeTeam)}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#fbf9f5] border border-[#E4E2DE] flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  {match.homeTeam?.logo ? (
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-[#0D631B]">
                      shield
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base md:text-xl font-black text-[#1B1C1A] text-center group-hover:text-[#0D631B] transition-colors line-clamp-2">
                  {match.homeTeam?.name}
                </h3>
              </Link>
            </div>

            {/* Score Center */}
            <div className="w-1/3 flex justify-center items-center">
              {isFinished ? (
                <div className="text-4xl md:text-6xl font-black text-[#1B1C1A] tracking-tighter flex items-center gap-2 md:gap-4 font-headline">
                  <span>{match.homeScore}</span>
                  <span className="text-[#D8D4CE] font-light">-</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : (
                <div className="text-4xl font-black text-[#D8D4CE] tracking-widest font-headline">
                  VS
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center w-1/3 group">
              <Link
                to={getTeamDetailPath(match.awayTeam)}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#fbf9f5] border border-[#E4E2DE] flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  {match.awayTeam?.logo ? (
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-[#3A45A4]">
                      shield
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base md:text-xl font-black text-[#1B1C1A] text-center group-hover:text-[#3A45A4] transition-colors line-clamp-2">
                  {match.awayTeam?.name}
                </h3>
              </Link>
            </div>
          </div>

          {/* Quick Events Summary (Goals) */}
          {isFinished && (
            <div className="flex justify-between items-start mt-10 pt-6 border-t border-[#E4E2DE] text-[13px] text-[#4A4B48] font-medium px-4 md:px-12">
              <div className="flex-1 flex flex-col items-end gap-1.5 pr-8 border-r border-[#E4E2DE]/50">
                {listEventMatch
                  .filter(
                    (e) =>
                      e.teamName === match.homeTeam?.name &&
                      ["GOAL", "PENALTY"].includes(e.eventType),
                  )
                  .map((e, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span>
                        {e.playerName} {e.minute}'
                      </span>
                      <span>{EVENT_ICONS[e.eventType]}</span>
                    </div>
                  ))}
              </div>
              <div className="flex-1 flex flex-col items-start gap-1.5 pl-8">
                {listEventMatch
                  .filter(
                    (e) =>
                      e.teamName === match.awayTeam?.name &&
                      ["GOAL", "PENALTY"].includes(e.eventType),
                  )
                  .map((e, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span>{EVENT_ICONS[e.eventType]}</span>
                      <span>
                        {e.playerName} {e.minute}'
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="mx-auto max-w-[960px] w-full mt-8 px-4">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(27,28,26,0.02)] border border-[#E4E2DE] p-1.5">
            <div className="grid grid-cols-3 items-center">
              {tabs.map((tab) => (
                <div key={tab.id} className="flex justify-center">
                  <button
                    onClick={() => handleButtonOnclickLabel(tab.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      tab.id === selectedLabel
                        ? "bg-[#1B1C1A] text-white shadow-md"
                        : "text-[#707A6C] hover:bg-[#F5F3EF] hover:text-[#1B1C1A]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* TABS CONTENT */}
        <div className="bg-white rounded-[28px] shadow-[0_4px_12px_rgba(27,28,26,0.03)] border border-[#E4E2DE] p-6 md:p-10 min-h-[400px]">
          {selectedLabel === "event" && (
            <AnimatedPanel panelKey="event">
              {listEventMatch.length > 0 ? (
                <div className="max-w-3xl mx-auto relative before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:bg-[#E4E2DE] before:-translate-x-1/2 space-y-6">
                  {listEventMatch.map((e, index) => {
                    const isHome = e.teamName === match.homeTeam?.name;
                    return (
                      <div
                        key={index}
                        className={`relative flex items-center justify-between w-full ${isHome ? "flex-row" : "flex-row-reverse"}`}
                      >
                        <div className="w-5/12 flex justify-end">
                          {isHome && (
                            <div className="bg-[#fbf9f5] border border-[#E4E2DE] p-3 rounded-2xl shadow-sm text-right flex items-center gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-[#1B1C1A]">
                                  {e.playerName || "Cầu thủ"}
                                </p>
                                <p className="text-[11px] text-[#707A6C] font-medium">
                                  {e.description}
                                </p>
                              </div>
                              <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                                {EVENT_ICONS[e.eventType] || "🎯"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="z-10 w-10 h-10 bg-white border-4 border-[#1B1C1A] rounded-full flex items-center justify-center font-black text-xs shadow-md">
                          {e.minute}'
                        </div>

                        <div className="w-5/12 flex justify-start">
                          {!isHome && (
                            <div className="bg-[#fbf9f5] border border-[#E4E2DE] p-3 rounded-2xl shadow-sm text-left flex items-center gap-3">
                              <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                                {EVENT_ICONS[e.eventType] || "🎯"}
                              </span>
                              <div className="flex-1">
                                <p className="font-bold text-[#1B1C1A]">
                                  {e.playerName || "Cầu thủ"}
                                </p>
                                <p className="text-[11px] text-[#707A6C] font-medium">
                                  {e.description}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-[#D8D4CE] mb-4">
                    sports_score
                  </span>
                  <p className="text-[#707A6C] font-bold">
                    Chưa có sự kiện nào được ghi nhận cho trận đấu này.
                  </p>
                </div>
              )}
            </AnimatedPanel>
          )}

          {selectedLabel === "lineup" && (
            <AnimatedPanel panelKey="lineup">
              {listPlayerInLineUp.length > 0 ? (
                <div className="animate-match-detail-lineup-shell">
                  <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto px-4">
                    <div className="text-center flex-1">
                      <h4 className="font-bold text-[#0D631B]">
                        {match.homeTeam?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-[#707A6C] uppercase">
                        {homeFormation.join("-")}
                      </p>
                    </div>
                    <div className="px-4 py-1 bg-[#F5F3EF] rounded-full text-xs font-bold text-[#707A6C]">
                      VS
                    </div>
                    <div className="text-center flex-1">
                      <h4 className="font-bold text-[#3A45A4]">
                        {match.awayTeam?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-[#707A6C] uppercase">
                        {awayFormation.join("-")}
                      </p>
                    </div>
                  </div>
                  <LineupField players={finalPlayers} />
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-[#D8D4CE] mb-4">
                    groups
                  </span>
                  <p className="text-[#707A6C] font-bold">
                    Đội hình ra sân chưa được cập nhật.
                  </p>
                </div>
              )}
            </AnimatedPanel>
          )}

          {selectedLabel === "stats" && (
            <AnimatedPanel panelKey="stats">
              <div className="max-w-2xl mx-auto space-y-2 py-4">
                {labelStats(matchStats, safe, StatRow)}
              </div>
            </AnimatedPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
