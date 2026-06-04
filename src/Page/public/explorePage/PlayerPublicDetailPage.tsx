import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Flag,
  Shield,
  Trophy,
  UserRound,
} from "lucide-react";

import type { Player } from "../../../model/Player";
import type { PlayerSeason } from "../../../model/PlayerSeason";
import type { TeamModel } from "../../../model/TeamModel";
import MatchService, {
  type ManOfTheMatchStatsResponse,
} from "../../../services/MatchService";
import PlayerSeasonService from "../../../services/PlayerSeasonService";
import PlayerService from "../../../services/PlayerService";
import PlayerStatsService, {
  type PlayerStatsResponse,
} from "../../../services/PlayerStatsService";
import TeamService from "../../../services/TeamService";

type TabKey = "overview" | "stats" | "history" | "matches";

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

type PlayerSeasonStats = PlayerStatsResponse & {
  seasonName?: string;
  motmAwards?: number;
};

type PublicMatch = {
  id?: number;
  matchDate?: string | Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: { id?: number; name?: string };
  awayTeam?: { id?: number; name?: string };
  homeTeamName?: string;
  awayTeamName?: string;
};

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <UserRound size={16} /> },
  { key: "stats", label: "Thống kê theo mùa", icon: <Trophy size={16} /> },
  {
    key: "history",
    label: "Lịch sử mùa giải",
    icon: <CalendarDays size={16} />,
  },
  { key: "matches", label: "Trận đấu liên quan", icon: <Shield size={16} /> },
];

const fallbackAvatar =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=320";
const fallbackTeamLogo =
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

function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function getStringField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
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

function playerTypeLabel(player: Player | null) {
  const rawType =
    getStringField(player, "playerType") || getStringField(player, "type");
  if (rawType === "DOMESTIC") return "Nội binh";
  if (rawType === "FOREIGN") return "Ngoại binh";
  if (!player) return "Đang cập nhật";
  return player.nationality && player.nationality !== "Việt Nam"
    ? "Ngoại binh"
    : "Nội binh";
}

function statusLabel(value?: string | null) {
  if (!value) return "Đang cập nhật";
  if (value === "ACTIVE") return "Đang hoạt động";
  if (value === "INACTIVE") return "Tạm dừng";
  if (value === "INJURED") return "Chấn thương";
  if (value === "SUSPENDED") return "Bị treo giò";
  if (value === "FINISHED") return "Đã kết thúc";
  if (value === "SCHEDULED") return "Sắp diễn ra";
  return value;
}

function matchTeamNames(match: PublicMatch) {
  return {
    home: match.homeTeam?.name || match.homeTeamName || "Đội nhà",
    away: match.awayTeam?.name || match.awayTeamName || "Đội khách",
  };
}

async function loadStatsForPlayer(
  playerId: number,
  playerSeasons: PlayerSeason[],
): Promise<PlayerSeasonStats[]> {
  const seasonIds = Array.from(
    new Set(playerSeasons.map((row) => row.seasonId).filter(Boolean)),
  );

  const statsResults = await Promise.allSettled(
    seasonIds.map(async (seasonId) => {
      const [statsRes, motmRes] = await Promise.allSettled([
        PlayerStatsService.getBySeason(seasonId),
        MatchService.getManOfTheMatchStats(seasonId),
      ]);

      const stats =
        statsRes.status === "fulfilled"
          ? readArray<PlayerStatsResponse>(statsRes.value.data).find(
              (row) => row.playerId === playerId,
            )
          : undefined;
      const motm =
        motmRes.status === "fulfilled"
          ? readArray<ManOfTheMatchStatsResponse>(motmRes.value.data).find(
              (row) => row.playerId === playerId,
            )
          : undefined;
      const seasonRow = playerSeasons.find((row) => row.seasonId === seasonId);

      if (!stats && !motm) return null;

      return {
        id: stats?.id ?? seasonId,
        playerId,
        playerName:
          stats?.playerName ?? motm?.playerName ?? seasonRow?.playerName ?? "",
        teamId: stats?.teamId ?? motm?.teamId ?? seasonRow?.teamId ?? null,
        teamName:
          stats?.teamName ?? motm?.teamName ?? seasonRow?.teamName ?? null,
        seasonId,
        seasonName: seasonRow?.seasonName,
        goals: stats?.goals ?? 0,
        assists: stats?.assists ?? 0,
        yellowCards: stats?.yellowCards ?? 0,
        redCards: stats?.redCards ?? 0,
        appearances: stats?.appearances ?? 0,
        motmAwards: motm?.awardCount ?? 0,
      } satisfies PlayerSeasonStats;
    }),
  );

  return statsResults
    .flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : [],
    )
    .sort((a, b) => Number(b.seasonId) - Number(a.seasonId));
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

export default function PlayerPublicDetailPage() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const numericPlayerId = getNumericId(playerId);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<TeamModel | null>(null);
  const [playerSeasons, setPlayerSeasons] = useState<PlayerSeason[]>([]);
  const [seasonStats, setSeasonStats] = useState<PlayerSeasonStats[]>([]);
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadPlayer = async () => {
      if (!numericPlayerId) {
        setWarnings(["Đường dẫn cầu thủ không hợp lệ."]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextWarnings: string[] = [];

      const playerRes = await Promise.allSettled([
        PlayerService.getPlayerById(numericPlayerId),
      ]);

      if (!mounted) return;

      if (playerRes[0].status !== "fulfilled") {
        console.warn(
          "PlayerPublicDetailPage: cannot load player",
          playerRes[0].reason,
        );
        setWarnings(["Không tải được thông tin cầu thủ."]);
        setLoading(false);
        return;
      }

      const playerData = playerRes[0].value;
      setPlayer(playerData);

      const [teamRes, historyRes, matchRes] = await Promise.allSettled([
        playerData.teamId
          ? TeamService.getTeamById(playerData.teamId)
          : Promise.resolve(null),
        PlayerSeasonService.getAllPlayerSeasons(0, 200, {
          playerId: numericPlayerId,
        }),
        playerData.teamId
          ? MatchService.getAllMatches(0, 100, { teamId: playerData.teamId })
          : Promise.resolve({ data: [] }),
      ]);

      if (!mounted) return;

      if (teamRes.status === "fulfilled") {
        setTeam(teamRes.value);
      } else {
        nextWarnings.push("Không tải được đội hiện tại.");
        console.warn(
          "PlayerPublicDetailPage: cannot load team",
          teamRes.reason,
        );
      }

      let historyRows: PlayerSeason[] = [];
      if (historyRes.status === "fulfilled") {
        historyRows = readArray<PlayerSeason>(historyRes.value.data);
        setPlayerSeasons(historyRows);
      } else {
        nextWarnings.push("Không tải được lịch sử mùa giải của cầu thủ.");
        console.warn(
          "PlayerPublicDetailPage: cannot load player seasons",
          historyRes.reason,
        );
      }

      try {
        const stats = await loadStatsForPlayer(numericPlayerId, historyRows);
        if (mounted) setSeasonStats(stats);
      } catch (error) {
        nextWarnings.push("Không tải được thống kê theo mùa.");
        console.warn("PlayerPublicDetailPage: cannot load player stats", error);
      }

      if (matchRes.status === "fulfilled") {
        setMatches(readArray<PublicMatch>(matchRes.value?.data));
      } else {
        nextWarnings.push("Không tải được trận đấu liên quan.");
        console.warn(
          "PlayerPublicDetailPage: cannot load matches",
          matchRes.reason,
        );
      }

      setWarnings(nextWarnings);
      setLoading(false);
    };

    loadPlayer();

    return () => {
      mounted = false;
    };
  }, [numericPlayerId]);

  const totals = useMemo(
    () => ({
      goals: seasonStats.reduce((sum, row) => sum + (row.goals ?? 0), 0),
      yellowCards: seasonStats.reduce(
        (sum, row) => sum + (row.yellowCards ?? 0),
        0,
      ),
      redCards: seasonStats.reduce((sum, row) => sum + (row.redCards ?? 0), 0),
    }),
    [seasonStats],
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
            navigate(player?.teamId ? `/teams/${player.teamId}` : "/explore")
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
                src={player?.avatar || fallbackAvatar}
                alt={player?.name || "Cầu thủ"}
                className="h-32 w-32 rounded-3xl object-cover"
              />
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
                  Hồ sơ cầu thủ
                </p>
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {player?.name || "Cầu thủ"}
                </h1>
                <p className="mt-3 text-sm font-bold text-gray-500">
                  {player?.detailPosition ||
                    player?.position ||
                    "Vị trí đang cập nhật"}{" "}
                  • {team?.name || player?.teamName || "Chưa có đội"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#e8f7ed] px-5 py-4 text-[#1a6e38]">
              <p className="text-xs font-black uppercase tracking-widest">
                Trạng thái
              </p>
              <p className="mt-2 font-black">{statusLabel(player?.status)}</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-sm font-semibold leading-6 text-gray-500">
            {getStringField(player, "biography") ||
              getStringField(player, "description") ||
              "Tiểu sử cầu thủ đang được cập nhật trong hệ thống."}
          </p>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {warnings.join(" ")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            label="Tổng bàn thắng"
            value={totals.goals}
            icon={<Trophy size={20} />}
          />
          <MetricCard
            label="Thẻ vàng"
            value={totals.yellowCards}
            icon={<BadgeCheck size={20} />}
          />
          <MetricCard
            label="Thẻ đỏ"
            value={totals.redCards}
            icon={<Shield size={20} />}
          />
          <MetricCard
            label="Số mùa"
            value={playerSeasons.length}
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
              <h2 className="mb-4 text-lg font-black">Thông tin cầu thủ</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoItem label="Họ tên" value={player?.name} />
                <InfoItem
                  label="Ngày sinh"
                  value={formatDate(player?.dateOfBirth)}
                />
                <InfoItem
                  label="Tuổi"
                  value={calculateAge(player?.dateOfBirth)}
                />
                <InfoItem label="Quốc tịch" value={player?.nationality} />
                <InfoItem
                  label="Loại cầu thủ"
                  value={playerTypeLabel(player)}
                />
                <InfoItem
                  label="Chiều cao / Cân nặng"
                  value={`${player?.height ?? "--"} cm / ${player?.weight ?? "--"} kg`}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">Đội hiện tại</h2>
              {team || player?.teamName ? (
                <button
                  type="button"
                  onClick={() => {
                    const targetTeamId = team?.id ?? player?.teamId;
                    if (targetTeamId) navigate(`/teams/${targetTeamId}`);
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl bg-[#f5f3ef] p-4 text-left transition hover:bg-[#e8f7ed]"
                >
                  <img
                    src={team?.logo || fallbackTeamLogo}
                    alt={team?.name || player?.teamName || "Đội bóng"}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black">
                      {team?.name || player?.teamName}
                    </p>
                    <p className="mt-2 truncate text-sm font-bold text-gray-500">
                      {team?.city || team?.stadiumName || "Đang cập nhật"}
                    </p>
                  </div>
                </button>
              ) : (
                <EmptyState message="Cầu thủ chưa có đội hiện tại." />
              )}
            </div>
          </section>
        )}

        {activeTab === "stats" && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {seasonStats.length === 0 ? (
              <EmptyState message="Chưa có thống kê mùa giải." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-3">Mùa giải</th>
                      <th className="px-4 py-3">Đội bóng</th>
                      <th className="px-4 py-3">Số trận</th>
                      <th className="px-4 py-3">Bàn thắng</th>
                      <th className="px-4 py-3">Kiến tạo</th>
                      <th className="px-4 py-3">Thẻ vàng</th>
                      <th className="px-4 py-3">Thẻ đỏ</th>
                      <th className="px-4 py-3">Xuất sắc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonStats.map((row) => (
                      <tr
                        key={`${row.seasonId}-${row.playerId}`}
                        className="border-b border-gray-50"
                      >
                        <td className="px-4 py-4 font-black">
                          {row.seasonName || `Mùa #${row.seasonId}`}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.teamName || "--"}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.appearances ?? 0}
                        </td>
                        <td className="px-4 py-4 font-black text-[#1a6e38]">
                          {row.goals ?? 0}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.assists ?? 0}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.yellowCards ?? 0}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.redCards ?? 0}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {row.motmAwards ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section>
            {playerSeasons.length === 0 ? (
              <EmptyState message="Chưa có lịch sử mùa giải của cầu thủ." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {playerSeasons.map((row) => (
                  <div
                    key={
                      row.id ?? `${row.playerId}-${row.seasonId}-${row.teamId}`
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
                      {row.teamName || "Đội bóng"}
                    </button>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <InfoItem label="Số áo" value={row.shirtNumber || "--"} />
                      <InfoItem
                        label="Vị trí"
                        value={row.primaryPosition || player?.position || "--"}
                      />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      {getStringField(row, "status") || "Đăng ký"}
                    </p>
                  </div>
                ))}
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
                {matches.map((match) => {
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
                            {formatDate(match.matchDate)}
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
                })}
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
