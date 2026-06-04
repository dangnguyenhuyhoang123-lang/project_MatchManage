import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import type { League } from "../../../model/LeagueModel";
import LeagueService from "../../../services/LeagueService";
import MatchService from "../../../services/MatchService";
import SeasonService from "../../../services/SeasonService";

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

type PublicMatch = {
  id?: number;
  matchDate?: string | Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
};

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

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

function getStringField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function getSeasonTitle(season: PublicSeason) {
  return season.name || season.year || `Mùa giải #${season.id ?? "--"}`;
}

function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
}

function seasonPeriod(season: PublicSeason) {
  const start = formatDate(season.startDate);
  const end = formatDate(season.endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "Đang cập nhật thời gian";
}

function statusLabel(value?: string | null) {
  if (!value) return "Đang cập nhật";
  if (value === "ACTIVE") return "Đang hoạt động";
  if (value === "INACTIVE") return "Tạm dừng";
  if (value === "FINISHED") return "Đã kết thúc";
  if (value === "ONGOING") return "Đang diễn ra";
  if (value === "SCHEDULED") return "Sắp diễn ra";
  if (value === "LIVE") return "Đang đá";
  return value;
}

function getTeamId(team: PublicTeam) {
  return team.team?.id ?? team.teamId ?? team.id;
}

function getTeamName(team: PublicTeam) {
  return team.team?.name || team.teamName || team.name || "Đội bóng";
}

function getTeamLogo(team: PublicTeam) {
  return team.team?.logo || team.logo || defaultTeamLogo;
}

function getMatchTeamNames(match: PublicMatch) {
  return {
    home: match.homeTeam?.name || match.homeTeamName || "Đội nhà",
    away: match.awayTeam?.name || match.awayTeamName || "Đội khách",
  };
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-8 text-center text-sm font-bold text-gray-500">
      {message}
    </div>
  );
}

export default function LeagueDetailPage() {
  const navigate = useNavigate();
  const { leagueId } = useParams();
  const numericLeagueId = getNumericId(leagueId);
  const [league, setLeague] = useState<League | null>(null);
  const [seasons, setSeasons] = useState<PublicSeason[]>([]);
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  const latestSeason = useMemo(() => {
    return [...seasons].sort((a, b) => {
      const yearDiff = Number(b.year ?? 0) - Number(a.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      return Number(b.id ?? 0) - Number(a.id ?? 0);
    })[0];
  }, [seasons]);

  useEffect(() => {
    let mounted = true;

    const loadLeague = async () => {
      if (!numericLeagueId) {
        setLoading(false);
        setWarnings(["Đường dẫn giải đấu không hợp lệ."]);
        return;
      }

      setLoading(true);
      const nextWarnings: string[] = [];

      const [leagueRes, seasonsRes] = await Promise.allSettled([
        LeagueService.getLeagueById(numericLeagueId),
        LeagueService.getSeasonsByLeague(numericLeagueId),
      ]);

      if (!mounted) return;

      if (leagueRes.status === "fulfilled") {
        setLeague(leagueRes.value);
      } else {
        nextWarnings.push("Không tải được thông tin giải đấu.");
        console.warn("LeagueDetailPage: cannot load league", leagueRes.reason);
      }

      let seasonList: PublicSeason[] = [];
      if (seasonsRes.status === "fulfilled") {
        seasonList = seasonsRes.value;
        setSeasons(seasonList);
      } else {
        nextWarnings.push("Không tải được danh sách mùa giải.");
        console.warn(
          "LeagueDetailPage: cannot load league seasons",
          seasonsRes.reason,
        );
      }

      const latest = [...seasonList].sort((a, b) => {
        const yearDiff = Number(b.year ?? 0) - Number(a.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
        return Number(b.id ?? 0) - Number(a.id ?? 0);
      })[0];

      if (latest?.id) {
        const [teamsRes, matchesRes] = await Promise.allSettled([
          SeasonService.getTeamsBySeason(latest.id),
          MatchService.getAllMatches(0, 6, { seasonId: latest.id }),
        ]);

        if (!mounted) return;

        if (teamsRes.status === "fulfilled") {
          setTeams(readArray<PublicTeam>(teamsRes.value.data));
        } else {
          nextWarnings.push("Không tải được đội tham gia mùa mới nhất.");
          console.warn(
            "LeagueDetailPage: cannot load season teams",
            teamsRes.reason,
          );
        }

        if (matchesRes.status === "fulfilled") {
          setMatches(readArray<PublicMatch>(matchesRes.value.data));
        } else {
          nextWarnings.push("Không tải được trận gần đây.");
          console.warn(
            "LeagueDetailPage: cannot load recent matches",
            matchesRes.reason,
          );
        }
      }

      setWarnings(nextWarnings);
      setLoading(false);
    };

    loadLeague();

    return () => {
      mounted = false;
    };
  }, [numericLeagueId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf9f5] px-4 py-10 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
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
          onClick={() => navigate("/explore")}
          className="inline-flex items-center gap-2 text-sm font-black text-gray-500 transition hover:text-[#1a6e38]"
        >
          <ArrowLeft size={16} />
          Quay lại khám phá
        </button>

        <header className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
                Chi tiết giải đấu
              </p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                {league?.name || "Giải đấu"}
              </h1>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-gray-500">
                {getStringField(league, "description") ||
                  league?.country ||
                  "Thông tin mô tả giải đấu đang được cập nhật."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <div className="rounded-2xl bg-[#e8f7ed] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                  Mùa giải
                </p>
                <p className="mt-2 text-2xl font-black">{seasons.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f5f3ef] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Trạng thái
                </p>
                <p className="mt-2 text-sm font-black">
                  {statusLabel(league?.status)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {warnings.join(" ")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="text-[#1a6e38]" size={22} />
              <h2 className="text-lg font-black">Mùa giải mới nhất</h2>
            </div>
            {latestSeason ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/leagues/${numericLeagueId}/seasons/${latestSeason.id}`,
                  )
                }
                className="w-full rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
              >
                <p className="text-xl font-black">
                  {getSeasonTitle(latestSeason)}
                </p>
                <p className="mt-2 text-sm font-bold text-gray-500">
                  {seasonPeriod(latestSeason)}
                </p>
              </button>
            ) : (
              <EmptyState message="Giải đấu này chưa có mùa giải." />
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <CalendarDays className="text-[#1a6e38]" size={22} />
              <h2 className="text-lg font-black">Danh sách mùa giải</h2>
            </div>
            {seasons.length === 0 ? (
              <EmptyState message="Chưa có mùa giải để hiển thị." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {seasons.map((season) => (
                  <button
                    key={season.id ?? getSeasonTitle(season)}
                    type="button"
                    onClick={() =>
                      season.id &&
                      navigate(
                        `/leagues/${numericLeagueId}/seasons/${season.id}`,
                      )
                    }
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:border-[#1a6e38]/30 hover:shadow-sm"
                  >
                    <p className="font-black">{getSeasonTitle(season)}</p>
                    <p className="mt-2 text-sm font-bold text-gray-500">
                      {seasonPeriod(season)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Users className="text-[#1a6e38]" size={22} />
              <h2 className="text-lg font-black">Các đội tham gia</h2>
            </div>
            {teams.length === 0 ? (
              <EmptyState message="Chưa có dữ liệu đội tham gia cho mùa mới nhất." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {teams.map((team) => (
                  <button
                    key={getTeamId(team) ?? getTeamName(team)}
                    type="button"
                    onClick={() => {
                      const teamId = getTeamId(team);
                      if (teamId) navigate(`/teams/${teamId}`);
                    }}
                    className="flex items-center gap-3 rounded-2xl bg-[#f5f3ef] p-3 text-left transition hover:bg-[#e8f7ed]"
                  >
                    <img
                      src={getTeamLogo(team)}
                      alt={getTeamName(team)}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-black">{getTeamName(team)}</p>
                      <p className="truncate text-xs font-bold text-gray-500">
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
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="text-[#1a6e38]" size={22} />
              <h2 className="text-lg font-black">Trận gần đây</h2>
            </div>
            {matches.length === 0 ? (
              <EmptyState message="Chưa có dữ liệu trận đấu cho mùa mới nhất." />
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
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
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">
                          {names.home} vs {names.away}
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1a6e38]">
                          {statusLabel(match.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-500">
                        {formatDate(match.matchDate)}
                        {match.homeScore != null && match.awayScore != null
                          ? ` • ${match.homeScore} - ${match.awayScore}`
                          : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Shield size={14} />
          Trang public chỉ hiển thị dữ liệu, không có thao tác quản trị.
        </div>
      </div>
    </main>
  );
}
