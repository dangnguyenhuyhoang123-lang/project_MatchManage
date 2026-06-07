import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Shield,
  Star,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

import type { ManOfTheMatchStatsResponse } from "../../../services/MatchService";
import MatchService from "../../../services/MatchService";
import PlayerStatsService, {
  type PlayerStatsResponse,
} from "../../../services/PlayerStatsService";
import PlayerSuspensionService, {
  type PlayerSuspensionResponse,
} from "../../../services/PlayerSuspensionService";
import SeasonService from "../../../services/SeasonService";
import StandingService from "../../../services/StandingService";
import { usePublicRealtimeEvent } from "../../../hooks/usePublicRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";

type TabKey =
  | "overview"
  | "standings"
  | "teams"
  | "matches"
  | "players"
  | "discipline";

type PublicSeason = {
  id?: number;
  name?: string;
  year?: string;
  leagueId?: number | string | null;
  leagueName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
};

type PublicTeam = {
  id?: number;
  teamId?: number;
  name?: string;
  teamName?: string;
  logo?: string | null;
  city?: string | null;
  stadiumName?: string | null;
  team?: {
    id?: number;
    name?: string;
    logo?: string | null;
    city?: string | null;
    stadiumName?: string | null;
  };
};

type StandingRow = {
  id?: number;
  rank?: number;
  rankPosition?: number;
  teamName?: string;
  name?: string;
  clubName?: string;
  played?: number;
  matchesPlayed?: number;
  win?: number;
  won?: number;
  wins?: number;
  draw?: number;
  drawn?: number;
  draws?: number;
  lose?: number;
  lost?: number;
  losses?: number;
  goalsFor?: number;
  goalFor?: number;
  totalGoalsFor?: number;
  goalsAgainst?: number;
  goalAgainst?: number;
  totalGoalsAgainst?: number;
  goalDifference?: number;
  points?: number;
};

type PublicMatch = {
  id?: number;
  matchDate?: string | Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeam?: { id?: number; name?: string };
  awayTeam?: { id?: number; name?: string };
  roundName?: string;
  round?: { name?: string };
};

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <Trophy size={16} /> },
  { key: "standings", label: "Bảng xếp hạng", icon: <Shield size={16} /> },
  { key: "teams", label: "Đội tham gia", icon: <Users size={16} /> },
  { key: "matches", label: "Lịch & kết quả", icon: <CalendarDays size={16} /> },
  { key: "players", label: "Cầu thủ nổi bật", icon: <Star size={16} /> },
  { key: "discipline", label: "Kỷ luật", icon: <UserCheck size={16} /> },
];

const defaultTeamLogo =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=240";

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  if (Array.isArray(page?.content)) return page.content;
  if (Array.isArray(page?.data)) return page.data;
  if (page?.data && typeof page.data === "object")
    return readArray<T>(page.data);
  return [];
}

// Lấy numeric id.
function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

// Định dạng date.
function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
}

// Xử lý season title.
function seasonTitle(season: PublicSeason | null) {
  return season?.name || season?.year || `Mùa giải #${season?.id ?? "--"}`;
}

// Xử lý season period.
function seasonPeriod(season: PublicSeason | null) {
  const start = formatDate(season?.startDate);
  const end = formatDate(season?.endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "Đang cập nhật thời gian";
}

// Xử lý status label.
function statusLabel(value?: string | null) {
  if (!value) return "Đang cập nhật";
  if (value === "ACTIVE") return "Đang hoạt động";
  if (value === "INACTIVE") return "Tạm dừng";
  if (value === "FINISHED") return "Đã kết thúc";
  if (value === "ONGOING") return "Đang diễn ra";
  if (value === "SCHEDULED") return "Sắp diễn ra";
  if (value === "LIVE") return "Đang đá";
  if (value === "CANCELLED") return "Đã hủy";
  return value;
}

// Lấy team id.
function getTeamId(team: PublicTeam) {
  return team.team?.id ?? team.teamId ?? team.id;
}

// Lấy team name.
function getTeamName(team: PublicTeam) {
  return team.team?.name || team.teamName || team.name || "Đội bóng";
}

// Lấy team logo.
function getTeamLogo(team: PublicTeam) {
  return team.team?.logo || team.logo || defaultTeamLogo;
}

// Xử lý standing team name.
function standingTeamName(row: StandingRow) {
  return row.teamName || row.name || row.clubName || "Đội bóng";
}

// Xử lý played.
function played(row: StandingRow) {
  return row.played ?? row.matchesPlayed ?? 0;
}

// Xử lý wins.
function wins(row: StandingRow) {
  return row.win ?? row.won ?? row.wins ?? 0;
}

// Xử lý draws.
function draws(row: StandingRow) {
  return row.draw ?? row.drawn ?? row.draws ?? 0;
}

// Xử lý losses.
function losses(row: StandingRow) {
  return row.lose ?? row.lost ?? row.losses ?? 0;
}

// Xử lý goals for.
function goalsFor(row: StandingRow) {
  return row.goalsFor ?? row.goalFor ?? row.totalGoalsFor ?? 0;
}

// Xử lý goals against.
function goalsAgainst(row: StandingRow) {
  return row.goalsAgainst ?? row.goalAgainst ?? row.totalGoalsAgainst ?? 0;
}

// Xử lý goal difference.
function goalDifference(row: StandingRow) {
  const value = row.goalDifference ?? goalsFor(row) - goalsAgainst(row);
  return value > 0 ? `+${value}` : String(value);
}

// Lấy match team names.
function getMatchTeamNames(match: PublicMatch) {
  return {
    home: match.homeTeam?.name || match.homeTeamName || "Đội nhà",
    away: match.awayTeam?.name || match.awayTeamName || "Đội khách",
  };
}

// Xử lý suspension reason.
function suspensionReason(reason?: string) {
  if (reason === "RED_CARD") return "Thẻ đỏ";
  if (reason === "TWO_YELLOWS") return "Hai thẻ vàng";
  return reason || "Kỷ luật";
}

// Hiển thị EmptyState.
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-8 text-center text-sm font-bold text-gray-500">
      {message}
    </div>
  );
}

// Hiển thị MetricCard.
function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f7ed] text-[#1a6e38]">
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-gray-950">{value}</p>
    </div>
  );
}

// Hiển thị SeasonDetailPage.
export default function SeasonDetailPage() {
  const navigate = useNavigate();
  const { leagueId, seasonId } = useParams();
  const numericLeagueId = getNumericId(leagueId);
  const numericSeasonId = getNumericId(seasonId);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [season, setSeason] = useState<PublicSeason | null>(null);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStatsResponse[]>([]);
  const [cards, setCards] = useState<PlayerStatsResponse[]>([]);
  const [suspensions, setSuspensions] = useState<PlayerSuspensionResponse[]>(
    [],
  );
  const [motmStats, setMotmStats] = useState<ManOfTheMatchStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  const fetchStandings = useCallback(async () => {
    if (!numericSeasonId) {
      setStandings([]);
      return;
    }

    try {
      const response = await StandingService.getAllStandings(numericSeasonId);
      setStandings(readArray<StandingRow>(response.data));
    } catch (error) {
      console.warn("SeasonDetailPage: cannot reload standings", error);
    }
  }, [numericSeasonId]);

  const fetchSeasonMatches = useCallback(async () => {
    if (!numericSeasonId) {
      setMatches([]);
      return;
    }

    try {
      const response = await MatchService.getAllMatches(0, 100, {
        seasonId: numericSeasonId,
      });
      setMatches(readArray<PublicMatch>(response.data));
    } catch (error) {
      console.warn("SeasonDetailPage: cannot reload matches", error);
    }
  }, [numericSeasonId]);

  const loadSeason = useCallback(async () => {
    if (!numericSeasonId) {
      setLoading(false);
      setWarnings(["Đường dẫn mùa giải không hợp lệ."]);
      return;
    }

    setLoading(true);
    const nextWarnings: string[] = [];
    const [
      seasonRes,
      standingRes,
      teamsRes,
      matchesRes,
      scorerRes,
      cardRes,
      suspensionRes,
      motmRes,
    ] = await Promise.allSettled([
      SeasonService.getSeasonById(numericSeasonId),
      StandingService.getAllStandings(numericSeasonId),
      SeasonService.getTeamsBySeason(numericSeasonId),
      MatchService.getAllMatches(0, 100, { seasonId: numericSeasonId }),
      PlayerStatsService.getTopScorers(numericSeasonId),
      PlayerStatsService.getCards(numericSeasonId),
      PlayerSuspensionService.getBySeason(numericSeasonId),
      MatchService.getManOfTheMatchStats(numericSeasonId),
    ]);

    if (seasonRes.status === "fulfilled") {
      setSeason(seasonRes.value.data);
    } else {
      nextWarnings.push("Không tải được thông tin mùa giải.");
      console.warn("SeasonDetailPage: cannot load season", seasonRes.reason);
    }

    if (standingRes.status === "fulfilled") {
      setStandings(readArray<StandingRow>(standingRes.value.data));
    } else {
      nextWarnings.push("Không tải được bảng xếp hạng.");
      console.warn(
        "SeasonDetailPage: cannot load standings",
        standingRes.reason,
      );
    }

    if (teamsRes.status === "fulfilled") {
      setTeams(readArray<PublicTeam>(teamsRes.value.data));
    } else {
      nextWarnings.push("Không tải được đội tham gia.");
      console.warn("SeasonDetailPage: cannot load teams", teamsRes.reason);
    }

    if (matchesRes.status === "fulfilled") {
      setMatches(readArray<PublicMatch>(matchesRes.value.data));
    } else {
      nextWarnings.push("Không tải được lịch và kết quả.");
      console.warn("SeasonDetailPage: cannot load matches", matchesRes.reason);
    }

    if (scorerRes.status === "fulfilled") {
      setTopScorers(readArray<PlayerStatsResponse>(scorerRes.value.data));
    } else {
      nextWarnings.push("Không tải được vua phá lưới.");
      console.warn(
        "SeasonDetailPage: cannot load top scorers",
        scorerRes.reason,
      );
    }

    if (cardRes.status === "fulfilled") {
      setCards(readArray<PlayerStatsResponse>(cardRes.value.data));
    } else {
      nextWarnings.push("Không tải được thống kê thẻ phạt.");
      console.warn("SeasonDetailPage: cannot load cards", cardRes.reason);
    }

    if (suspensionRes.status === "fulfilled") {
      setSuspensions(
        readArray<PlayerSuspensionResponse>(suspensionRes.value.data),
      );
    } else {
      nextWarnings.push("Không tải được danh sách treo giò.");
      console.warn(
        "SeasonDetailPage: cannot load suspensions",
        suspensionRes.reason,
      );
    }

    if (motmRes.status === "fulfilled") {
      setMotmStats(readArray<ManOfTheMatchStatsResponse>(motmRes.value.data));
    } else {
      nextWarnings.push("Không tải được cầu thủ xuất sắc.");
      console.warn("SeasonDetailPage: cannot load MOTM stats", motmRes.reason);
    }

    setWarnings(nextWarnings);
    setLoading(false);
  }, [numericSeasonId]);

  useEffect(() => {
    void loadSeason();
  }, [loadSeason]);

  const handlePublicRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_LEAGUES" ||
        event.action === "REFETCH_SEASONS" ||
        event.action === "REFETCH_ROUNDS" ||
        event.action === "REFETCH_SEASON_TEAMS" ||
        event.action === "REFETCH_MATCH_EVENTS" ||
        event.action === "REFETCH_MATCH_STATS"
      ) {
        void loadSeason();
        return;
      }

      if (
        event.action === "REFETCH_STANDINGS" ||
        event.action === "REFETCH_TEAM_STATS"
      ) {
        void fetchStandings();
        return;
      }

      if (
        event.action === "REFETCH_MATCHES" ||
        event.action === "REFETCH_MATCH_DETAIL" ||
        event.action === "REFETCH_LINEUPS"
      ) {
        void fetchSeasonMatches();
      }
    },
    [fetchSeasonMatches, fetchStandings, loadSeason],
  );

  usePublicRealtimeEvent(
    [
      "matches",
      "leagues",
      numericSeasonId ? `seasons/${numericSeasonId}/standings` : null,
    ],
    handlePublicRealtimeEvent,
  );

  const sortedStandings = useMemo(
    () =>
      [...standings].sort((a, b) => {
        const rankA = a.rank ?? a.rankPosition ?? 999;
        const rankB = b.rank ?? b.rankPosition ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return (b.points ?? 0) - (a.points ?? 0);
      }),
    [standings],
  );

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const first = a.matchDate ? new Date(a.matchDate).getTime() : 0;
        const second = b.matchDate ? new Date(b.matchDate).getTime() : 0;
        return first - second;
      }),
    [matches],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf9f5] px-4 py-10 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="h-32 animate-pulse rounded-2xl bg-white" />
            <div className="h-32 animate-pulse rounded-2xl bg-white" />
            <div className="h-32 animate-pulse rounded-2xl bg-white" />
            <div className="h-32 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf9f5] px-4 py-10 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <button
          type="button"
          onClick={() =>
            navigate(
              numericLeagueId ? `/leagues/${numericLeagueId}` : "/explore",
            )
          }
          className="inline-flex items-center gap-2 text-sm font-black text-gray-500 transition hover:text-[#1a6e38]"
        >
          <ArrowLeft size={16} />
          Quay lại giải đấu
        </button>

        <header className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
            Chi tiết mùa giải
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            {seasonTitle(season)}
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-gray-500">
            {season?.leagueName || "Giải đấu"} • {seasonPeriod(season)} •{" "}
            {statusLabel(season?.status)}
          </p>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {warnings.join(" ")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            label="Đội tham gia"
            value={teams.length}
            icon={<Users size={20} />}
          />
          <MetricCard
            label="Số trận"
            value={matches.length}
            icon={<CalendarDays size={20} />}
          />
          <MetricCard
            label="Bàn thắng"
            value={topScorers.reduce((sum, row) => sum + (row.goals ?? 0), 0)}
            icon={<Trophy size={20} />}
          />
          <MetricCard
            label="Thẻ phạt"
            value={cards.reduce(
              (sum, row) => sum + (row.yellowCards ?? 0) + (row.redCards ?? 0),
              0,
            )}
            icon={<UserCheck size={20} />}
          />
        </section>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                  activeTab === tab.key
                    ? "bg-[#1a6e38] text-white"
                    : "bg-[#f5f3ef] text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "overview" && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-lg font-black">Tổng quan mùa giải</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f3ef] p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Giải đấu
                  </p>
                  <p className="mt-2 font-black">
                    {season?.leagueName || `League #${numericLeagueId ?? "--"}`}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f5f3ef] p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Thời gian
                  </p>
                  <p className="mt-2 font-black">{seasonPeriod(season)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Dẫn đầu</h2>
              {sortedStandings[0] ? (
                <div className="rounded-2xl bg-[#e8f7ed] p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                    Hạng 1
                  </p>
                  <p className="mt-2 text-xl font-black">
                    {standingTeamName(sortedStandings[0])}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-600">
                    {sortedStandings[0].points ?? 0} điểm
                  </p>
                </div>
              ) : (
                <EmptyState message="Chưa có dữ liệu bảng xếp hạng." />
              )}
            </div>
          </section>
        )}

        {activeTab === "standings" && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {sortedStandings.length === 0 ? (
              <EmptyState message="Mùa giải này chưa có bảng xếp hạng." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-3">Hạng</th>
                      <th className="px-4 py-3">Đội</th>
                      <th className="px-4 py-3">Trận</th>
                      <th className="px-4 py-3">Thắng</th>
                      <th className="px-4 py-3">Hòa</th>
                      <th className="px-4 py-3">Thua</th>
                      <th className="px-4 py-3">BT-BB</th>
                      <th className="px-4 py-3">HS</th>
                      <th className="px-4 py-3">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((row, index) => (
                      <tr
                        key={row.id ?? standingTeamName(row)}
                        className="border-b border-gray-50"
                      >
                        <td className="px-4 py-4 font-black">
                          {row.rank ?? row.rankPosition ?? index + 1}
                        </td>
                        <td className="px-4 py-4 font-black">
                          {standingTeamName(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {played(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {wins(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {draws(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {losses(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {goalsFor(row)}-{goalsAgainst(row)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {goalDifference(row)}
                        </td>
                        <td className="px-4 py-4 font-black text-[#1a6e38]">
                          {row.points ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "teams" && (
          <section>
            {teams.length === 0 ? (
              <EmptyState message="Chưa có đội tham gia mùa giải này." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                  <button
                    key={getTeamId(team) ?? getTeamName(team)}
                    type="button"
                    onClick={() => {
                      const teamId = getTeamId(team);
                      if (teamId) navigate(`/teams/${teamId}`);
                    }}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-[#1a6e38]/30 hover:shadow-md"
                  >
                    <img
                      src={getTeamLogo(team)}
                      alt={getTeamName(team)}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xl font-black">
                        {getTeamName(team)}
                      </p>
                      <p className="mt-2 truncate text-sm font-bold text-gray-500">
                        {team.team?.city ||
                          team.city ||
                          team.stadiumName ||
                          "Đang cập nhật"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "matches" && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {sortedMatches.length === 0 ? (
              <EmptyState message="Chưa có lịch thi đấu hoặc kết quả cho mùa giải này." />
            ) : (
              <div className="space-y-3">
                {sortedMatches.map((match) => {
                  const names = getMatchTeamNames(match);
                  return (
                    <button
                      key={
                        match.id ??
                        `${names.home}-${names.away}-${match.matchDate}`
                      }
                      type="button"
                      onClick={() =>
                        match.id && navigate(`/matches/${match.id}`)
                      }
                      className="w-full rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-black">
                            {names.home} vs {names.away}
                          </p>
                          <p className="mt-1 text-sm font-bold text-gray-500">
                            {match.round?.name || match.roundName || "Vòng đấu"}{" "}
                            • {formatDate(match.matchDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1a6e38]">
                            {statusLabel(match.status)}
                          </span>
                          <span className="text-xl font-black">
                            {match.homeScore != null && match.awayScore != null
                              ? `${match.homeScore} - ${match.awayScore}`
                              : "vs"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "players" && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Vua phá lưới</h2>
              {topScorers.length === 0 ? (
                <EmptyState message="Chưa có thống kê vua phá lưới." />
              ) : (
                <div className="space-y-3">
                  {topScorers.slice(0, 10).map((row, index) => (
                    <div
                      key={row.id ?? row.playerId}
                      className="flex items-center justify-between rounded-2xl bg-[#f5f3ef] p-4"
                    >
                      <div>
                        <p className="font-black">
                          #{index + 1} {row.playerName}
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-500">
                          {row.teamName || "--"}
                        </p>
                      </div>
                      <p className="text-xl font-black text-[#1a6e38]">
                        {row.goals ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Cầu thủ xuất sắc</h2>
              {motmStats.length === 0 ? (
                <EmptyState message="Chưa có thống kê cầu thủ xuất sắc." />
              ) : (
                <div className="space-y-3">
                  {motmStats.slice(0, 10).map((row, index) => (
                    <div
                      key={row.playerId}
                      className="flex items-center justify-between rounded-2xl bg-[#f5f3ef] p-4"
                    >
                      <div>
                        <p className="font-black">
                          #{index + 1} {row.playerName}
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-500">
                          {row.teamName || "--"}
                        </p>
                      </div>
                      <p className="text-xl font-black text-[#1a6e38]">
                        {row.awardCount ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "discipline" && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Thẻ phạt</h2>
              {cards.length === 0 ? (
                <EmptyState message="Chưa có thống kê thẻ phạt." />
              ) : (
                <div className="space-y-3">
                  {cards.slice(0, 12).map((row) => (
                    <div
                      key={row.id ?? row.playerId}
                      className="rounded-2xl bg-[#f5f3ef] p-4"
                    >
                      <p className="font-black">{row.playerName}</p>
                      <p className="mt-1 text-sm font-bold text-gray-500">
                        {row.teamName || "--"}
                      </p>
                      <p className="mt-3 text-sm font-black text-gray-700">
                        Vàng: {row.yellowCards ?? 0} • Đỏ: {row.redCards ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Treo giò</h2>
              {suspensions.length === 0 ? (
                <EmptyState message="Không có cầu thủ bị treo giò." />
              ) : (
                <div className="space-y-3">
                  {suspensions.map((row) => (
                    <div key={row.id} className="rounded-2xl bg-[#f5f3ef] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{row.playerName}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1a6e38]">
                          {row.served ? "Đã thi hành" : "Đang áp dụng"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-500">
                        {suspensionReason(row.reason)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Shield size={14} />
          Trang public chỉ đọc dữ liệu, không có thao tác quản trị.
        </div>
      </div>
    </main>
  );
}
