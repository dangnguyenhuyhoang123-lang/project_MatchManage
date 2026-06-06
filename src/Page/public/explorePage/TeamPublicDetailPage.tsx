import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import type { Coach } from "../../../model/CoachModel";
import type { Player } from "../../../model/Player";
import type { TeamModel } from "../../../model/TeamModel";
import CoachService from "../../../services/CoachService";
import MatchService from "../../../services/MatchService";
import PlayerService from "../../../services/PlayerService";
import SeasonTeamService from "../../../services/SeasonTeamService";
import StadiumService from "../../../services/StadiumService";
import TeamService from "../../../services/TeamService";

type TabKey =
  | "overview"
  | "players"
  | "coaches"
  | "stadium"
  | "seasons"
  | "matches";

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

type PublicStadium = {
  id?: number;
  name?: string;
  stadiumName?: string;
  address?: string;
  location?: string;
  city?: string;
  country?: string;
  capacity?: number;
  fifaStarRating?: number;
  grassType?: string;
  surfaceType?: string;
  imageUrl?: string | null;
  image?: string | null;
  avatar?: string | null;
  photo?: string | null;
  description?: string;
  status?: string;
};

type SeasonTeamRow = {
  id?: number;
  seasonId?: number;
  seasonName?: string;
  year?: string;
  leagueId?: number;
  leagueName?: string;
  status?: string;
  notes?: string;
  achievement?: string;
  rank?: number;
  points?: number;
};

type PublicMatch = {
  id?: number;
  matchDate?: string | Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  stadiumName?: string;
  stadium?: { name?: string };
  homeTeam?: { id?: number; name?: string; stadiumName?: string };
  awayTeam?: { id?: number; name?: string };
  homeTeamName?: string;
  awayTeamName?: string;
};

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <Trophy size={16} /> },
  { key: "players", label: "Cầu thủ", icon: <Users size={16} /> },
  { key: "coaches", label: "Ban huấn luyện", icon: <UserRound size={16} /> },
  { key: "stadium", label: "Sân vận động", icon: <MapPin size={16} /> },
  { key: "seasons", label: "Mùa giải", icon: <CalendarDays size={16} /> },
  { key: "matches", label: "Trận đấu", icon: <Shield size={16} /> },
];

const fallbackTeamLogo =
  "https://i.pinimg.com/736x/45/a7/09/45a709b49ff148ce35634bc0b84749ac.jpg";
const fallbackAvatar =
  "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-ff-ngau-91.jpg";
const fallbackStadiumImage =
  "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=900";

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  if (Array.isArray(page?.content)) return page.content;
  if (Array.isArray(page?.data)) return page.data;
  if (page?.data && typeof page.data === "object")
    return readArray<T>(page.data);
  return [];
}

function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function getStringField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function getNumberField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return undefined;
  return getNumericId((item as Record<string, unknown>)[field]);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Đang cập nhật";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
}

function calculateAge(value?: string | null) {
  if (!value) return "";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return Number.isFinite(age) && age > 0 ? `${age} tuổi` : "";
}

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

function playerTypeLabel(player: Player) {
  const rawType =
    getStringField(player, "playerType") || getStringField(player, "type");
  if (rawType === "DOMESTIC") return "Nội binh";
  if (rawType === "FOREIGN") return "Ngoại binh";
  return (
    rawType ||
    (player.nationality && player.nationality !== "Việt Nam"
      ? "Ngoại binh"
      : "Nội binh")
  );
}

function stadiumName(stadium: PublicStadium | null, fallback?: string | null) {
  return (
    stadium?.name || stadium?.stadiumName || fallback || "Chưa cập nhật sân"
  );
}

function stadiumAddress(stadium: PublicStadium | null) {
  return stadium?.address || stadium?.location || "Chưa cập nhật địa chỉ";
}

function stadiumImage(stadium: PublicStadium | null) {
  return (
    stadium?.imageUrl ||
    stadium?.image ||
    stadium?.avatar ||
    stadium?.photo ||
    fallbackStadiumImage
  );
}

function matchTeamNames(match: PublicMatch) {
  return {
    home: match.homeTeam?.name || match.homeTeamName || "Đội nhà",
    away: match.awayTeam?.name || match.awayTeamName || "Đội khách",
  };
}

function matchHasTeam(match: PublicMatch, teamId: number) {
  return match.homeTeam?.id === teamId || match.awayTeam?.id === teamId;
}

function matchStadium(match: PublicMatch) {
  return (
    match.stadium?.name ||
    match.stadiumName ||
    match.homeTeam?.stadiumName ||
    "Chưa cập nhật sân"
  );
}

async function loadTeamStadium(team: TeamModel): Promise<PublicStadium | null> {
  if (team.stadiumId) {
    const response = await StadiumService.getStadiumById(team.stadiumId);
    return response.data ?? null;
  }

  if (team.stadiumName) {
    const response = await StadiumService.getAllStadiums(team.stadiumName);
    return readArray<PublicStadium>(response.data)[0] ?? null;
  }

  return null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-8 text-center text-sm font-bold text-gray-500">
      {message}
    </div>
  );
}

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

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#f5f3ef] p-4">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-2 font-black text-gray-900">
        {value || "Đang cập nhật"}
      </p>
    </div>
  );
}

export default function TeamPublicDetailPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const numericTeamId = getNumericId(teamId);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [team, setTeam] = useState<TeamModel | null>(null);
  const [stadium, setStadium] = useState<PublicStadium | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<SeasonTeamRow[]>([]);
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadTeam = async () => {
      if (!numericTeamId) {
        setWarnings(["Đường dẫn đội bóng không hợp lệ."]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextWarnings: string[] = [];

      const teamRes = await Promise.allSettled([
        TeamService.getTeamById(numericTeamId),
      ]);
      if (!mounted) return;

      if (teamRes[0].status !== "fulfilled") {
        console.warn(
          "TeamPublicDetailPage: cannot load team",
          teamRes[0].reason,
        );
        setWarnings(["Không tải được thông tin đội bóng."]);
        setLoading(false);
        return;
      }

      const teamData = teamRes[0].value;
      setTeam(teamData);

      const [stadiumRes, playersRes, coachesRes, seasonTeamsRes, matchesRes] =
        await Promise.allSettled([
          loadTeamStadium(teamData),
          PlayerService.getPlayersByTeamNormalized(numericTeamId, 0, 300),
          CoachService.getCoachesByTeamNormalized(numericTeamId, 0, 100),
          SeasonTeamService.getAllSeasonTeams(0, 200, {
            teamId: numericTeamId,
          }),
          MatchService.getAllMatches(0, 200, { teamId: numericTeamId }),
        ]);

      if (!mounted) return;

      if (stadiumRes.status === "fulfilled") {
        setStadium(stadiumRes.value);
      } else {
        nextWarnings.push("Không tải được thông tin sân vận động.");
        console.warn(
          "TeamPublicDetailPage: cannot load stadium",
          stadiumRes.reason,
        );
      }

      if (playersRes.status === "fulfilled") {
        setPlayers(readArray<Player>(playersRes.value));
      } else {
        nextWarnings.push("Không tải được danh sách cầu thủ.");
        console.warn(
          "TeamPublicDetailPage: cannot load players",
          playersRes.reason,
        );
      }

      if (coachesRes.status === "fulfilled") {
        setCoaches(readArray<Coach>(coachesRes.value));
      } else {
        nextWarnings.push("Không tải được ban huấn luyện.");
        console.warn(
          "TeamPublicDetailPage: cannot load coaches",
          coachesRes.reason,
        );
      }

      if (seasonTeamsRes.status === "fulfilled") {
        setSeasonTeams(readArray<SeasonTeamRow>(seasonTeamsRes.value.data));
      } else {
        nextWarnings.push("Không tải được mùa giải đội đã tham gia.");
        console.warn(
          "TeamPublicDetailPage: cannot load season-team rows",
          seasonTeamsRes.reason,
        );
      }

      if (matchesRes.status === "fulfilled") {
        const loadedMatches = readArray<PublicMatch>(matchesRes.value.data);
        const filteredMatches = loadedMatches.some((match) =>
          matchHasTeam(match, numericTeamId),
        )
          ? loadedMatches.filter((match) => matchHasTeam(match, numericTeamId))
          : loadedMatches;
        setMatches(filteredMatches);
      } else {
        nextWarnings.push("Không tải được trận đấu gần đây.");
        console.warn(
          "TeamPublicDetailPage: cannot load matches",
          matchesRes.reason,
        );
      }

      setWarnings(nextWarnings);
      setLoading(false);
    };

    loadTeam();

    return () => {
      mounted = false;
    };
  }, [numericTeamId]);

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const first = a.matchDate ? new Date(a.matchDate).getTime() : 0;
        const second = b.matchDate ? new Date(b.matchDate).getTime() : 0;
        return second - first;
      }),
    [matches],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf9f5] px-4 py-10 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
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
          onClick={() => navigate("/explore")}
          className="inline-flex items-center gap-2 text-sm font-black text-gray-500 transition hover:text-[#1a6e38]"
        >
          <ArrowLeft size={16} />
          Quay lại khám phá
        </button>

        <header className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                src={team?.logo || fallbackTeamLogo}
                alt={team?.name || "Đội bóng"}
                className="h-28 w-28 rounded-3xl object-cover"
              />
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
                  Hồ sơ đội bóng
                </p>
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {team?.name || "Đội bóng"}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500">
                  <MapPin size={16} />
                  {team?.city || team?.region || "Địa phương đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#e8f7ed] px-5 py-4 text-[#1a6e38]">
              <p className="text-xs font-black uppercase tracking-widest">
                Trạng thái
              </p>
              <p className="mt-2 font-black">{statusLabel(team?.status)}</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-sm font-semibold leading-6 text-gray-500">
            {team?.description ||
              "Thông tin mô tả đội bóng đang được cập nhật trong hệ thống."}
          </p>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {warnings.join(" ")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            label="Số cầu thủ"
            value={players.length}
            icon={<Users size={20} />}
          />
          <MetricCard
            label="Số HLV"
            value={coaches.length}
            icon={<UserRound size={20} />}
          />
          <MetricCard
            label="Sân nhà"
            value={
              <span className="text-lg">
                {stadiumName(stadium, team?.stadiumName)}
              </span>
            }
            icon={<MapPin size={20} />}
          />
          <MetricCard
            label="Số trận ghi nhận"
            value={matches.length}
            icon={<CalendarDays size={20} />}
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
              <h2 className="mb-4 text-lg font-black">Thông tin đội bóng</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoItem label="Tên đội" value={team?.name} />
                <InfoItem label="Thành phố" value={team?.city} />
                <InfoItem label="Khu vực" value={team?.region} />
                <InfoItem
                  label="Chủ sở hữu"
                  value={team?.owner || getStringField(team, "organization")}
                />
                <InfoItem
                  label="Năm thành lập"
                  value={
                    team?.establishedYear || getNumberField(team, "foundedYear")
                  }
                />
                <InfoItem
                  label="Sân nhà"
                  value={stadiumName(stadium, team?.stadiumName)}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Trận gần nhất</h2>
              {sortedMatches[0] ? (
                <button
                  type="button"
                  onClick={() =>
                    sortedMatches[0].id &&
                    navigate(`/matches/${sortedMatches[0].id}`)
                  }
                  className="w-full rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
                >
                  <p className="font-black">
                    {matchTeamNames(sortedMatches[0]).home} vs{" "}
                    {matchTeamNames(sortedMatches[0]).away}
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-500">
                    {formatDate(sortedMatches[0].matchDate)} •{" "}
                    {statusLabel(sortedMatches[0].status)}
                  </p>
                </button>
              ) : (
                <EmptyState message="Chưa có trận đấu được ghi nhận." />
              )}
            </div>
          </section>
        )}

        {activeTab === "players" && (
          <section>
            {players.length === 0 ? (
              <EmptyState message="Đội bóng này chưa có cầu thủ trong hệ thống." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {players.map((player) => (
                  <button
                    key={player.id ?? player.name}
                    type="button"
                    onClick={() =>
                      player.id && navigate(`/players/${player.id}`)
                    }
                    className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-[#1a6e38]/30 hover:shadow-md"
                  >
                    <img
                      src={player.avatar || fallbackAvatar}
                      alt={player.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xl font-black">
                        {player.name}
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-500">
                        {player.detailPosition ||
                          player.position ||
                          "Vị trí N/A"}
                      </p>
                      <p className="mt-2 text-xs font-black text-[#1a6e38]">
                        {player.nationality || "Quốc tịch N/A"} •{" "}
                        {playerTypeLabel(player)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-400">
                        {formatDate(player.dateOfBirth)}
                        {calculateAge(player.dateOfBirth)
                          ? ` • ${calculateAge(player.dateOfBirth)}`
                          : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "coaches" && (
          <section>
            {coaches.length === 0 ? (
              <EmptyState message="Đội bóng này chưa có dữ liệu ban huấn luyện." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {coaches.map((coach) => (
                  <button
                    key={coach.id ?? coach.name}
                    type="button"
                    onClick={() => coach.id && navigate(`/coaches/${coach.id}`)}
                    className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-[#1a6e38]/30 hover:shadow-md"
                  >
                    <img
                      src={coach.avatar || fallbackAvatar}
                      alt={coach.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xl font-black">
                        {coach.name}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#1a6e38]">
                        {getStringField(coach, "role") ||
                          coach.description ||
                          "Huấn luyện viên"}
                      </p>
                      <p className="mt-2 text-xs font-black text-gray-500">
                        {coach.nationality || "Quốc tịch N/A"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-400">
                        {formatDate(coach.birthDay)}
                        {calculateAge(coach.birthDay)
                          ? ` • ${calculateAge(coach.birthDay)}`
                          : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "stadium" && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
            <img
              src={stadiumImage(stadium)}
              alt={stadiumName(stadium, team?.stadiumName)}
              className="h-72 w-full rounded-2xl object-cover shadow-sm"
            />
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-black">
                {stadiumName(stadium, team?.stadiumName)}
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoItem label="Địa chỉ" value={stadiumAddress(stadium)} />
                <InfoItem
                  label="Thành phố"
                  value={stadium?.city || team?.city}
                />
                <InfoItem
                  label="Quốc gia"
                  value={stadium?.country || "Việt Nam"}
                />
                <InfoItem
                  label="Sức chứa"
                  value={
                    stadium?.capacity
                      ? `${stadium.capacity.toLocaleString("vi-VN")} chỗ`
                      : "Đang cập nhật"
                  }
                />
                <InfoItem
                  label="Tiêu chuẩn FIFA"
                  value={
                    stadium?.fifaStarRating
                      ? `${stadium.fifaStarRating} sao`
                      : "Đang cập nhật"
                  }
                />
                <InfoItem
                  label="Mặt sân"
                  value={stadium?.grassType || stadium?.surfaceType}
                />
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-gray-500">
                {stadium?.description ||
                  "Thông tin mô tả sân vận động đang được cập nhật."}
              </p>
            </div>
          </section>
        )}

        {activeTab === "seasons" && (
          <section>
            {seasonTeams.length === 0 ? (
              <EmptyState message="Chưa có dữ liệu mùa giải tham gia." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {seasonTeams.map((row) => (
                  <button
                    key={row.id ?? `${row.seasonId}-${row.seasonName}`}
                    type="button"
                    onClick={() => {
                      if (row.leagueId && row.seasonId) {
                        navigate(
                          `/leagues/${row.leagueId}/seasons/${row.seasonId}`,
                        );
                      }
                    }}
                    className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-[#1a6e38]/30 hover:shadow-md"
                  >
                    <p className="text-xl font-black">
                      {row.seasonName ||
                        row.year ||
                        `Mùa #${row.seasonId ?? "--"}`}
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-500">
                      {row.leagueName || "Giải đấu đang cập nhật"}
                    </p>
                    <p className="mt-4 rounded-full bg-[#e8f7ed] px-3 py-1 text-xs font-black text-[#1a6e38]">
                      {row.achievement ||
                        row.notes ||
                        (row.rank
                          ? `Hạng ${row.rank}`
                          : statusLabel(row.status))}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "matches" && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {sortedMatches.length === 0 ? (
              <EmptyState message="Chưa có trận đấu hoặc kết quả của đội bóng này." />
            ) : (
              <div className="space-y-3">
                {sortedMatches.map((match) => {
                  const names = matchTeamNames(match);
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
                            {formatDate(match.matchDate)} •{" "}
                            {matchStadium(match)}
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

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Shield size={14} />
          Trang public chỉ đọc dữ liệu, không có thao tác thêm sửa xóa.
        </div>
      </div>
    </main>
  );
}
