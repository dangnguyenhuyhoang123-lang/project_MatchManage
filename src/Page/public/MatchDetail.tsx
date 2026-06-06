import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import MatchService from "../../services/MatchService";
import MatchRefereeService, {
  type MatchRefereeResponse,
} from "../../services/MatchRefereeService";
import type { TeamModel } from "../../model/TeamModel";
import { MatchModel } from "../../model/Match/MatchModel";
import type { MatchEvent } from "../../model/Match/MatchEvents";
import type { MatchStats } from "../../model/Match/MatchStats";
import type {
  MatchLineupsResponse,
  MatchTactics,
  MatchLineup,
} from "../../model/Match/MatchLineup";

import { getTeamDetailPath } from "../../utils/teamRoute";
import { AnimatedPanel } from "../../components/AnimationPanel/AnimatedPanel";
import { usePublicRealtimeEvent } from "../../hooks/usePublicRealtimeEvent";
import type { RealtimeEventDTO } from "../../model/RealtimeEvent";

type MatchDetailPlayer = MatchLineup & {
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

const EVENT_ICONS: Record<string, string> = {
  GOAL: "⚽",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
  SUBSTITUTION: "🔄",
  PENALTY: "⚽",
};

const tabs = [
  { id: "event", label: "DIỄN BIẾN CHÍNH", icon: "sports_score" },
  { id: "lineup", label: "ĐỘI HÌNH RA SÂN", icon: "groups" },
  { id: "stats", label: "THỐNG KÊ", icon: "query_stats" },
];

const normalizeTacticsLineups = (
  data: MatchLineupsResponse,
): MatchDetailPlayer[] => {
  const tacticsList = [data.home, data.away].filter(Boolean) as MatchTactics[];

  return tacticsList
    .flatMap((teamTactics) =>
      (teamTactics.lineups ?? []).map((player) => {
        const lineupPlayer: MatchDetailPlayer = {
          ...player,

          // Quan trọng: id để render/key có thể dùng lineup id,
          // nhưng để match event thì nên giữ playerId riêng.
          id: player.id,
          playerId: player.playerId,

          teamId: teamTactics.teamId,
          teamName: teamTactics.teamName,

          avatar: player.avatar ?? "",
          position: player.position,
          shirtNumber: player.shirtNumber,
          isStarting: Boolean(player.isStarting),
          lineupOrder: player.lineupOrder ?? 0,
          role: player.role ?? null,
        };

        return lineupPlayer;
      }),
    )
    .sort((a, b) => {
      if (a.teamId !== b.teamId) return (a.teamId ?? 0) - (b.teamId ?? 0);
      if (a.isStarting !== b.isStarting) return a.isStarting ? -1 : 1;
      return (a.lineupOrder ?? 0) - (b.lineupOrder ?? 0);
    });
};

const sortEventsByMinute = (events: MatchEvent[]) =>
  [...events].sort((a, b) => {
    const minuteA = a.minute ?? 0;
    const minuteB = b.minute ?? 0;

    if (minuteA !== minuteB) return minuteA - minuteB;

    return (a.extraMinute ?? 0) - (b.extraMinute ?? 0);
  });

const isSameTeam = (player: MatchDetailPlayer, team?: TeamModel | null) => {
  if (!team) return false;

  if (player.teamId != null && team.id != null) {
    return player.teamId === team.id;
  }

  return player.teamName === team.name;
};

const mapLineup = (
  players: MatchDetailPlayer[],
  formation: number[],
  isHome: boolean,
) => {
  const result: PlayerRender[] = [];

  const gk = players.find((p) => p.position === "GK");
  const others = players.filter((p) => p.position !== "GK");

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

  let index = 0;
  const totalLines = formation.length;

  formation.forEach((count, lineIndex) => {
    for (let i = 0; i < count; i++) {
      const p = others[index++];
      if (!p) continue;

      const CENTER_SHIFT_X = 5.5;

      const rawX = ((i + 1) * 100) / (count + 1);
      const x = Math.min(92, Math.max(8, rawX + CENTER_SHIFT_X));

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

const enrichWithEvents = (
  players: PlayerRender[],
  events: MatchEvent[],
): PlayerRender[] => {
  return players.map((p) => {
    const event = events.find(
      (ev) => ev.playerId === p.playerId || ev.playerName === p.playerName,
    );

    return {
      ...p,
      event: event ? EVENT_ICONS[event.eventType] : null,
    };
  });
};

const detectFormation = (players: MatchDetailPlayer[]) => {
  const lines: Record<string, number> = {
    DEF: 0,
    MID: 0,
    ATT: 0,
  };

  players.forEach((p) => {
    const position = p.position ?? "";

    if (["DF", "RB", "LB", "CB", "RCB", "LCB"].includes(position)) {
      lines.DEF++;
    } else if (["MF", "CDM", "CM", "RCM", "LCM"].includes(position)) {
      lines.MID++;
    } else if (["FW", "RW", "LW", "ST", "CF"].includes(position)) {
      lines.ATT++;
    }
  });

  return [lines.DEF, lines.MID, lines.ATT].filter((count) => count > 0);
};

const LineupField = ({ players }: { players: PlayerRender[] }) => {
  return (
    <div className="relative mx-auto w-full max-w-5xl h-[780px] md:h-[900px] lg:h-[980px] rounded-[32px] overflow-hidden border border-[#D8D4CE] bg-[#1a6e38] shadow-inner">
      {/* Field background */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.06)_50%,transparent_50%)] bg-[length:100%_120px]" />

      {/* Halfway line */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/50" />

      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50" />
      <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

      {/* Penalty boxes */}
      <div className="absolute left-1/2 top-0 w-64 h-24 -translate-x-1/2 border-x-2 border-b-2 border-white/50 rounded-b-xl" />
      <div className="absolute left-1/2 bottom-0 w-64 h-24 -translate-x-1/2 border-x-2 border-t-2 border-white/50 rounded-t-xl" />

      {/* Goals */}
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
};

const MatchDetail = () => {
  const { id } = useParams();
  const matchId = Number(id);
  const hasValidMatchId = Boolean(id) && Number.isFinite(matchId);

  const [match, setMatch] = useState<MatchModel | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats[]>([]);
  const [listEventMatch, setListEventMatch] = useState<MatchEvent[]>([]);
  const [listPlayerInLineUp, setListPlayerInLineUp] = useState<
    MatchDetailPlayer[]
  >([]);
  const [officials, setOfficials] = useState<MatchRefereeResponse[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("stats");
  const [loading, setLoading] = useState(true);

  const resetMatchData = useCallback((message?: string) => {
    setMatch(null);
    setMatchStats([]);
    setListEventMatch([]);
    setListPlayerInLineUp([]);
    setOfficials([]);
    setError(message ?? null);
  }, []);

  const loadMatchDetail = useCallback(async () => {
    if (!hasValidMatchId) return null;

    const matchData = await MatchService.getMatchById(matchId);
    setMatch(matchData);
    return matchData;
  }, [hasValidMatchId, matchId]);

  const loadMatchStats = useCallback(async () => {
    if (!hasValidMatchId) return;

    try {
      const statsData = await MatchService.getStatsMatch(matchId);
      setMatchStats(statsData);
    } catch (error) {
      console.warn("Cannot load public match stats", error);
      setMatchStats([]);
    }
  }, [hasValidMatchId, matchId]);

  const loadMatchEvents = useCallback(async () => {
    if (!hasValidMatchId) return;

    try {
      const eventsData = await MatchService.getListEventMatch(matchId);
      setListEventMatch(sortEventsByMinute(eventsData));
    } catch (error) {
      console.warn("Cannot load public match events", error);
      setListEventMatch([]);
    }
  }, [hasValidMatchId, matchId]);

  const loadLineups = useCallback(async () => {
    if (!hasValidMatchId) return;

    try {
      const lineupData = await MatchService.getMatchLineups(matchId);
      setListPlayerInLineUp(normalizeTacticsLineups(lineupData));
    } catch (error) {
      console.warn("Cannot load public match lineups", error);
      setListPlayerInLineUp([]);
    }
  }, [hasValidMatchId, matchId]);

  const loadOfficials = useCallback(async () => {
    if (!hasValidMatchId) return;

    try {
      const officialsResponse = await MatchRefereeService.getByMatch(matchId);
      setOfficials(
        Array.isArray(officialsResponse.data) ? officialsResponse.data : [],
      );
    } catch (error) {
      console.warn("Cannot load public match officials", error);
      setOfficials([]);
    }
  }, [hasValidMatchId, matchId]);

  useEffect(() => {
    if (!hasValidMatchId) {
      resetMatchData();
      setError("Mã trận đấu không hợp lệ.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        if (cancelled) return;

        await loadMatchDetail();
        await Promise.all([
          loadMatchStats(),
          loadMatchEvents(),
          loadLineups(),
          loadOfficials(),
        ]);
      } catch (error) {
        if (cancelled) return;

        console.error("Lỗi khi tải chi tiết trận đấu:", error);

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
  }, [
    hasValidMatchId,
    loadLineups,
    loadMatchDetail,
    loadMatchEvents,
    loadMatchStats,
    loadOfficials,
    resetMatchData,
  ]);

  const handlePublicRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      const referenceId =
        event.referenceId == null ? Number.NaN : Number(event.referenceId);

      const isCurrentMatchEvent =
        !Number.isFinite(referenceId) ||
        referenceId === matchId ||
        event.referenceType === "MATCH_EVENT" ||
        event.referenceType === "MATCH_STATS" ||
        event.referenceType === "MATCH_LINEUP";

      if (!isCurrentMatchEvent) return;

      if (
        event.action === "REFETCH_MATCH_DETAIL" ||
        event.action === "REFETCH_MATCHES"
      ) {
        void loadMatchDetail();
      }

      if (event.action === "REFETCH_MATCH_EVENTS") {
        void loadMatchEvents();
        void loadMatchDetail();
      }

      if (event.action === "REFETCH_MATCH_STATS") {
        void loadMatchStats();
      }

      if (event.action === "REFETCH_LINEUPS") {
        void loadLineups();
      }

      if (event.action === "REFETCH_MATCH_REFEREES") {
        void loadOfficials();
      }
    },
    [
      loadLineups,
      loadMatchDetail,
      loadMatchEvents,
      loadMatchStats,
      loadOfficials,
      matchId,
    ],
  );

  usePublicRealtimeEvent(
    ["matches", hasValidMatchId ? `matches/${matchId}` : null],
    handlePublicRealtimeEvent,
  );

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

  if (!match) {
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

  const homeStats = matchStats.find(
    (stats) => stats.teamId === match.homeTeam?.id,
  );

  const awayStats = matchStats.find(
    (stats) => stats.teamId === match.awayTeam?.id,
  );

  const isFinished =
    match.status === "FINISHED" ||
    (match.homeScore != null && match.awayScore != null);

  return (
    <div className="w-full bg-[#fbf9f5] min-h-screen pb-12">
      {/* Banner / Header Background */}
      <div className="h-48 md:h-64 bg-[#1a6e38] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a6e38]"></div>
        <div className="z-10 text-center px-4">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            {match.season?.name || "Mùa giải"}
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

        <div className="mt-8 rounded-[28px] border border-[#E4E2DE] bg-white p-6 shadow-[0_4px_12px_rgba(27,28,26,0.03)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#008C2F]">
                Công bố trước trận
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1B1C1A]">
                Trọng tài trận đấu
              </h3>
            </div>
            <span className="material-symbols-outlined rounded-2xl bg-[#F5F3EF] p-3 text-[#008C2F]">
              gavel
            </span>
          </div>

          {officials.length === 0 ? (
            <p className="rounded-2xl bg-[#F5F3EF] p-4 text-sm font-bold text-[#707A6C]">
              Danh sách trọng tài của trận đấu chưa được công bố.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {officials.map((item) => (
                <div
                  key={`official-${item.id}`}
                  className="rounded-2xl bg-[#F5F3EF] p-4"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-[#707A6C]">
                    {item.role}
                  </p>
                  <p className="mt-1 font-black text-[#1B1C1A]">
                    {item.refereeName || `Trọng tài #${item.refereeId}`}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#707A6C]">
                    {item.refereeNationality || "--"}
                  </p>
                </div>
              ))}
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
                        ? "bg-[#1a6e38] text-white shadow-md"
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
                    const isHome =
                      e.teamId === match.homeTeam?.id ||
                      e.teamName === match.homeTeam?.name;

                    const eventIcon = EVENT_ICONS[e.eventType] || "🎯";
                    const eventMinute =
                      e.extraMinute != null
                        ? `${e.minute}+${e.extraMinute}'`
                        : `${e.minute}'`;

                    return (
                      <div
                        key={`${e.id ?? index}-${e.eventType}-${e.minute}`}
                        className="relative grid grid-cols-[1fr_48px_1fr] items-center w-full gap-4"
                      >
                        {/* HOME EVENT - LEFT SIDE */}
                        <div className="flex justify-end">
                          {isHome && (
                            <div className="bg-[#fbf9f5] border border-[#E4E2DE] p-3 rounded-2xl shadow-sm text-right flex items-center gap-3 max-w-[260px]">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1B1C1A] truncate">
                                  {e.playerName || "Cầu thủ"}
                                </p>

                                {e.note && (
                                  <p className="text-[11px] text-[#707A6C] font-medium mt-0.5">
                                    {e.note}
                                  </p>
                                )}
                              </div>

                              <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                {eventIcon}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* MINUTE CENTER */}
                        <div className="z-10 w-11 h-11 bg-white border-4 border-[#1B1C1A] rounded-full flex items-center justify-center font-black text-xs shadow-md mx-auto">
                          {eventMinute}
                        </div>

                        {/* AWAY EVENT - RIGHT SIDE */}
                        <div className="flex justify-start">
                          {!isHome && (
                            <div className="bg-[#fbf9f5] border border-[#E4E2DE] p-3 rounded-2xl shadow-sm text-left flex items-center gap-3 max-w-[260px]">
                              <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                {eventIcon}
                              </span>

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1B1C1A] truncate">
                                  {e.playerName || "Cầu thủ"}
                                </p>

                                {e.note && (
                                  <p className="text-[11px] text-[#707A6C] font-medium mt-0.5">
                                    {e.note}
                                  </p>
                                )}
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
                {homeStats || awayStats ? (
                  <>
                    <StatRow
                      left={safe(homeStats?.possession)}
                      right={safe(awayStats?.possession)}
                      label="Kiểm soát bóng"
                    />

                    <StatRow
                      left={safe(homeStats?.shots)}
                      right={safe(awayStats?.shots)}
                      label="Số cú sút"
                    />

                    <StatRow
                      left={safe(homeStats?.shotsOnTarget)}
                      right={safe(awayStats?.shotsOnTarget)}
                      label="Sút trúng đích"
                    />

                    <StatRow
                      left={safe(homeStats?.corners)}
                      right={safe(awayStats?.corners)}
                      label="Phạt góc"
                    />

                    <StatRow
                      left={safe(homeStats?.fouls)}
                      right={safe(awayStats?.fouls)}
                      label="Phạm lỗi"
                    />

                    <StatRow
                      left={safe(homeStats?.offsides)}
                      right={safe(awayStats?.offsides)}
                      label="Việt vị"
                    />

                    <StatRow
                      left={safe(homeStats?.yellowCards)}
                      right={safe(awayStats?.yellowCards)}
                      label="Thẻ vàng"
                    />

                    <StatRow
                      left={safe(homeStats?.redCards)}
                      right={safe(awayStats?.redCards)}
                      label="Thẻ đỏ"
                    />

                    <StatRow
                      left={safe(homeStats?.totalPasses)}
                      right={safe(awayStats?.totalPasses)}
                      label="Tổng đường chuyền"
                    />

                    <StatRow
                      left={safe(homeStats?.passAccuracy)}
                      right={safe(awayStats?.passAccuracy)}
                      label="Độ chính xác chuyền"
                    />
                  </>
                ) : (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-6xl text-[#D8D4CE] mb-4">
                      query_stats
                    </span>
                    <p className="text-[#707A6C] font-bold">
                      Thống kê trận đấu chưa được cập nhật.
                    </p>
                  </div>
                )}
              </div>
            </AnimatedPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
