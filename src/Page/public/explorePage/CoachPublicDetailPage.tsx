import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Shield,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import type { Coach } from "../../../model/CoachModel";
import type { SeasonTeam } from "../../../model/SeasonTeam";
import type { SeasonTeamCoach } from "../../../model/SeasonTeamCoach";
import type { TeamModel } from "../../../model/TeamModel";
import type { MatchModel } from "../../../model/Match/MatchModel";
import CoachService from "../../../services/CoachService";
import MatchService from "../../../services/MatchService";
import SeasonTeamCoachService from "../../../services/SeasonTeamCoachService";
import SeasonTeamService from "../../../services/SeasonTeamService";
import TeamService from "../../../services/TeamService";

type TabKey = "overview" | "team" | "seasons" | "matches";

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

type PublicMatch = Partial<MatchModel> & {
  id?: number;
  matchDate?: string | Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: { id?: number; name?: string; logo?: string | null };
  awayTeam?: { id?: number; name?: string; logo?: string | null };
  homeTeamName?: string;
  awayTeamName?: string;
  season?: { id?: number; name?: string; year?: string };
};

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <UserRound size={16} /> },
  { key: "team", label: "Đội đang dẫn dắt", icon: <Shield size={16} /> },
  { key: "seasons", label: "Mùa giải", icon: <CalendarDays size={16} /> },
  { key: "matches", label: "Trận liên quan", icon: <Trophy size={16} /> },
];

const fallbackAvatar =
  "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-ff-ngau-91.jpg";
const fallbackTeamLogo =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=260";

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  if (Array.isArray(page?.content)) return page.content;
  if (Array.isArray(page?.data)) return page.data;
  if (page?.data && typeof page.data === "object") {
    return readArray<T>(page.data);
  }
  return [];
}

// Lấy numeric id.
function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

// Lấy string field.
function getStringField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

// Chuẩn hóa coach.
function normalizeCoach(raw: any): Coach {
  return {
    id: raw?.id ?? raw?.coachId,
    name: raw?.name ?? raw?.coachName ?? "",
    nationality: raw?.nationality ?? "Việt Nam",
    idCode: raw?.idCode ?? raw?.license ?? "",
    avatar: raw?.avatar ?? raw?.image ?? "",
    birthDay: raw?.birthDay ?? raw?.birthday ?? raw?.dateOfBirth ?? "",
    description: raw?.description ?? raw?.role ?? "",
    status: raw?.status ?? "ACTIVE",
    teamId: raw?.teamId ?? raw?.team?.id ?? 0,
    teamName: raw?.teamName ?? raw?.team?.name ?? "",
  };
}

// Định dạng date.
function formatDate(value?: string | Date | null) {
  if (!value) return "Đang cập nhật";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
}

// Tính toán age.
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

// Xử lý status label.
function statusLabel(value?: string | null) {
  if (!value) return "Đang cập nhật";
  if (value === "ACTIVE") return "Đang hoạt động";
  if (value === "INACTIVE") return "Tạm dừng";
  if (value === "FINISHED") return "Đã kết thúc";
  if (value === "SCHEDULED") return "Sắp diễn ra";
  if (value === "LIVE") return "Trực tiếp";
  return value;
}

// Xử lý role label.
function roleLabel(value?: string | null) {
  if (!value) return "Huấn luyện viên";
  const normalized = value.toLowerCase();
  if (normalized.includes("head") || normalized.includes("trưởng")) {
    return "Huấn luyện viên trưởng";
  }
  if (normalized.includes("assistant") || normalized.includes("trợ")) {
    return "Trợ lý huấn luyện viên";
  }
  if (normalized.includes("goalkeeper") || normalized.includes("thủ môn")) {
    return "HLV thủ môn";
  }
  if (normalized.includes("fitness") || normalized.includes("thể lực")) {
    return "HLV thể lực";
  }
  return value;
}

// Xử lý match team names.
function matchTeamNames(match: PublicMatch) {
  return {
    home: match.homeTeam?.name || match.homeTeamName || "Đội nhà",
    away: match.awayTeam?.name || match.awayTeamName || "Đội khách",
  };
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

// Hiển thị InfoItem.
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

// Hiển thị CoachPublicDetailPage.
export default function CoachPublicDetailPage() {
  const navigate = useNavigate();
  const { coachId } = useParams();
  const numericCoachId = getNumericId(coachId);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [coach, setCoach] = useState<Coach | null>(null);
  const [team, setTeam] = useState<TeamModel | null>(null);
  const [assignments, setAssignments] = useState<SeasonTeamCoach[]>([]);
  const [teamSeasons, setTeamSeasons] = useState<SeasonTeam[]>([]);
  const [teamCoaches, setTeamCoaches] = useState<Coach[]>([]);
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    // Tải coach.
    const loadCoach = async () => {
      if (!numericCoachId) {
        setWarnings(["Đường dẫn huấn luyện viên không hợp lệ."]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextWarnings: string[] = [];

      const coachRes = await Promise.allSettled([
        CoachService.getCoachById(numericCoachId),
      ]);

      if (!mounted) return;

      if (coachRes[0].status !== "fulfilled") {
        console.warn(
          "CoachPublicDetailPage: cannot load coach",
          coachRes[0].reason,
        );
        setWarnings(["Không tải được thông tin huấn luyện viên."]);
        setLoading(false);
        return;
      }

      const coachData = normalizeCoach(coachRes[0].value.data);
      setCoach(coachData);

      const teamId = getNumericId(coachData.teamId);
      const [
        teamRes,
        assignmentsRes,
        teamSeasonsRes,
        teamCoachesRes,
        matchRes,
      ] = await Promise.allSettled([
        teamId ? TeamService.getTeamById(teamId) : Promise.resolve(null),
        SeasonTeamCoachService.getAllSeasonTeamCoaches(0, 200, {
          coachId: numericCoachId,
        }),
        teamId
          ? SeasonTeamService.getAllSeasonTeams(0, 200, { teamId })
          : Promise.resolve({ data: [] }),
        teamId
          ? CoachService.getCoachesByTeamNormalized(teamId, 0, 50)
          : Promise.resolve({ content: [] }),
        teamId
          ? MatchService.getAllMatches(0, 100, { teamId })
          : Promise.resolve({ data: [] }),
      ]);

      if (!mounted) return;

      if (teamRes.status === "fulfilled") {
        setTeam(teamRes.value);
      } else {
        nextWarnings.push("Không tải được đội bóng hiện tại.");
        console.warn("CoachPublicDetailPage: cannot load team", teamRes.reason);
      }

      if (assignmentsRes.status === "fulfilled") {
        setAssignments(readArray<SeasonTeamCoach>(assignmentsRes.value.data));
      } else {
        nextWarnings.push("Không tải được lịch sử phân công mùa giải.");
        console.warn(
          "CoachPublicDetailPage: cannot load assignments",
          assignmentsRes.reason,
        );
      }

      if (teamSeasonsRes.status === "fulfilled") {
        setTeamSeasons(readArray<SeasonTeam>(teamSeasonsRes.value.data));
      } else {
        nextWarnings.push("Không tải được các mùa giải của đội.");
        console.warn(
          "CoachPublicDetailPage: cannot load team seasons",
          teamSeasonsRes.reason,
        );
      }

      if (teamCoachesRes.status === "fulfilled") {
        setTeamCoaches(
          readArray<Coach>(teamCoachesRes.value).filter(
            (item) => item.id !== numericCoachId,
          ),
        );
      } else {
        nextWarnings.push("Không tải được ban huấn luyện cùng đội.");
        console.warn(
          "CoachPublicDetailPage: cannot load team coaches",
          teamCoachesRes.reason,
        );
      }

      if (matchRes.status === "fulfilled") {
        setMatches(readArray<PublicMatch>(matchRes.value.data));
      } else {
        nextWarnings.push("Không tải được trận đấu liên quan.");
        console.warn(
          "CoachPublicDetailPage: cannot load matches",
          matchRes.reason,
        );
      }

      setWarnings(nextWarnings);
      setLoading(false);
    };

    void loadCoach();

    return () => {
      mounted = false;
    };
  }, [numericCoachId]);

  const latestAssignment = useMemo(
    () =>
      [...assignments].sort((a, b) => {
        const aTime = new Date(a.assignedDate || "").getTime() || 0;
        const bTime = new Date(b.assignedDate || "").getTime() || 0;
        return bTime - aTime;
      })[0],
    [assignments],
  );

  const upcomingMatches = useMemo(
    () => matches.filter((match) => match.status !== "FINISHED").slice(0, 5),
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
          onClick={() =>
            navigate(coach?.teamId ? `/teams/${coach.teamId}` : "/explore")
          }
          className="inline-flex items-center gap-2 text-sm font-black text-gray-500 transition hover:text-[#1a6e38]"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <header className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                src={coach?.avatar || fallbackAvatar}
                alt={coach?.name || "Huấn luyện viên"}
                className="h-32 w-32 rounded-3xl object-cover"
              />
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
                  Hồ sơ huấn luyện viên
                </p>
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {coach?.name || "Huấn luyện viên"}
                </h1>
                <p className="mt-3 text-sm font-bold text-gray-500">
                  {roleLabel(latestAssignment?.role || coach?.description)} •{" "}
                  {team?.name || coach?.teamName || "Chưa có đội"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#e8f7ed] px-5 py-4 text-[#1a6e38]">
              <p className="text-xs font-black uppercase tracking-widest">
                Trạng thái
              </p>
              <p className="mt-2 font-black">{statusLabel(coach?.status)}</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-sm font-semibold leading-6 text-gray-500">
            {getStringField(coach, "biography") ||
              coach?.description ||
              "Thông tin chuyên môn của huấn luyện viên đang được cập nhật trong hệ thống."}
          </p>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {warnings.join(" ")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            label="Đội hiện tại"
            value={team?.name || coach?.teamName || "--"}
            icon={<Shield size={20} />}
          />
          <MetricCard
            label="Mùa tham gia"
            value={assignments.length || teamSeasons.length}
            icon={<CalendarDays size={20} />}
          />
          <MetricCard
            label="Trận của đội"
            value={matches.length}
            icon={<Trophy size={20} />}
          />
          <MetricCard
            label="Ban huấn luyện"
            value={teamCoaches.length + (coach ? 1 : 0)}
            icon={<UsersRound size={20} />}
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
              <h2 className="mb-4 text-lg font-black">
                Thông tin huấn luyện viên
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoItem label="Họ tên" value={coach?.name} />
                <InfoItem
                  label="Ngày sinh"
                  value={formatDate(coach?.birthDay)}
                />
                <InfoItem label="Tuổi" value={calculateAge(coach?.birthDay)} />
                <InfoItem label="Quốc tịch" value={coach?.nationality} />
                <InfoItem
                  label="Vai trò"
                  value={roleLabel(
                    latestAssignment?.role || coach?.description,
                  )}
                />
                <InfoItem label="Mã định danh" value={coach?.idCode} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Đội đang dẫn dắt</h2>
              {team || coach?.teamName ? (
                <button
                  type="button"
                  onClick={() => {
                    const targetTeamId = team?.id ?? coach?.teamId;
                    if (targetTeamId) navigate(`/teams/${targetTeamId}`);
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
                >
                  <img
                    src={team?.logo || fallbackTeamLogo}
                    alt={team?.name || coach?.teamName || "Đội bóng"}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black">
                      {team?.name || coach?.teamName}
                    </p>
                    <p className="mt-2 truncate text-sm font-bold text-gray-500">
                      {team?.city || team?.stadiumName || "Đang cập nhật"}
                    </p>
                  </div>
                </button>
              ) : (
                <EmptyState message="Huấn luyện viên chưa có đội hiện tại." />
              )}
            </div>
          </section>
        )}

        {activeTab === "team" && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Thông tin đội bóng</h2>
              {team ? (
                <div className="space-y-3">
                  <InfoItem label="Tên đội" value={team.name} />
                  <InfoItem label="Thành phố" value={team.city} />
                  <InfoItem label="Sân nhà" value={team.stadiumName} />
                  <InfoItem
                    label="Năm thành lập"
                    value={team.establishedYear}
                  />
                </div>
              ) : (
                <EmptyState message="Chưa có dữ liệu đội bóng." />
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-lg font-black">
                Ban huấn luyện cùng đội
              </h2>
              {teamCoaches.length === 0 ? (
                <EmptyState message="Chưa có thông tin các HLV khác trong đội." />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {teamCoaches.map((item) => (
                    <button
                      key={item.id ?? item.name}
                      type="button"
                      onClick={() => item.id && navigate(`/coaches/${item.id}`)}
                      className="flex items-center gap-3 rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
                    >
                      <img
                        src={item.avatar || fallbackAvatar}
                        alt={item.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-black">{item.name}</p>
                        <p className="truncate text-xs font-bold text-gray-500">
                          {roleLabel(item.description)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "seasons" && (
          <section>
            {assignments.length === 0 && teamSeasons.length === 0 ? (
              <EmptyState message="Chưa có dữ liệu mùa giải liên quan." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(assignments.length > 0 ? assignments : teamSeasons).map(
                  (row: SeasonTeamCoach | SeasonTeam) => {
                    const isAssignment = "coachId" in row;
                    return (
                      <div
                        key={
                          row.id ??
                          `${row.seasonId}-${row.teamId}-${isAssignment ? "coach" : "team"}`
                        }
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                      >
                        <p className="text-xl font-black">
                          {row.seasonName || `Mùa #${row.seasonId}`}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            row.teamId && navigate(`/teams/${row.teamId}`)
                          }
                          className="mt-2 text-sm font-black text-[#1a6e38] hover:underline"
                        >
                          {row.teamName || team?.name || "Đội bóng"}
                        </button>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <InfoItem
                            label="Vai trò"
                            value={
                              isAssignment
                                ? roleLabel((row as SeasonTeamCoach).role)
                                : roleLabel(coach?.description)
                            }
                          />
                          <InfoItem
                            label="Trạng thái"
                            value={statusLabel(row.status)}
                          />
                        </div>
                        {isAssignment && (
                          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            Từ{" "}
                            {formatDate((row as SeasonTeamCoach).assignedDate)}
                          </p>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "matches" && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {matches.length === 0 ? (
              <EmptyState message="Chưa có trận đấu liên quan để hiển thị." />
            ) : (
              <div className="space-y-3">
                {(upcomingMatches.length > 0 ? upcomingMatches : matches).map(
                  (match) => {
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
                              {match.season?.name ||
                                match.season?.year ||
                                "Mùa giải"}{" "}
                              • {formatDate(match.matchDate)}
                            </p>
                          </div>
                          <span className="text-xl font-black">
                            {match.homeScore != null && match.awayScore != null
                              ? `${match.homeScore} - ${match.awayScore}`
                              : statusLabel(match.status)}
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Flag size={14} />
          Trang public chỉ đọc dữ liệu, không có thao tác thêm sửa xóa.
        </div>
      </div>
    </main>
  );
}
