import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "../../../layouts/AppLayout";
import { Modal } from "../../../components/Modal";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { MatchStatus } from "../../../model/enum";
import MatchService from "../../../services/MatchService";
import TeamService from "../../../services/TeamService";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";
import MatchLineupModal from "./MatchLineupModal";
import { useNavigate } from "react-router-dom";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../services/websocket/NotificationSocketService";
import { MatchModel } from "../../../model/Match/MatchModel";
import { TeamModel } from "../../../model/TeamModel";

// Team constants are now dynamically fetched or imported

type StatusFilter = "SCHEDULED" | "LIVE" | "FINISHED";

const statusConfig: Record<
  StatusFilter,
  { label: string; badge: string; action: "edit" | "view" }
> = {
  SCHEDULED: {
    label: "Sắp thi đấu",
    badge: "bg-emerald-50 text-emerald-700",
    action: "edit",
  },
  LIVE: {
    label: "Đang diễn ra",
    badge: "bg-red-50 text-red-600",
    action: "view",
  },
  FINISHED: {
    label: "Đã kết thúc",
    badge: "bg-stone-100 text-stone-600",
    action: "view",
  },
};

const fallbackLogo =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&h=200&fit=crop";

const MatchManagePageClub: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [teamName, setTeamName] = useState("Đang tải...");
  const [selectedTeamSeasonId, setSelectedTeamSeasonId] = useState<
    number | null
  >(null);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("SCHEDULED");
  const [selectedMatch, setSelectedMatch] = useState<MatchModel | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "view">("edit");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = useCallback(async () => {
    if (authLoading) return;
    if (!currentClubId) {
      setLoading(false);
      setError("Không xác định được câu lạc bộ của người dùng.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [response, team] = await Promise.all([
        MatchService.getAllMatches(0, 200, {
          teamId: currentClubId,
        }),
        TeamService.getTeamById(currentClubId),
      ]);
      setTeamName(team?.name || "Câu lạc bộ");

      const normalized = extractMatches(response.data)
        .map(normalizeMatch)
        .filter(Boolean) as MatchModel[];

      setMatches(
        normalized.filter(
          (match) =>
            getHomeTeamId(match) === currentClubId ||
            getAwayTeamId(match) === currentClubId,
        ),
      );
    } catch (err) {
      console.error("Cannot load club matches", err);
      setError("Không thể tải danh sách trận đấu.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, currentClubId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_MATCHES" ||
        event.referenceType === "MATCH"
      ) {
        fetchMatches();
      }
    },
    [fetchMatches],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const filteredMatches = useMemo(
    () => matches.filter((match) => match.status === statusFilter),
    [matches, statusFilter],
  );

  const statusCounts = useMemo(
    () =>
      matches.reduce<Record<StatusFilter, number>>(
        (total, match) => {
          if (match.status in total) {
            total[match.status as StatusFilter] += 1;
          }
          return total;
        },
        { SCHEDULED: 0, LIVE: 0, FINISHED: 0 },
      ),
    [matches],
  );

  const nextMatch = useMemo(() => {
    const now = Date.now();
    return matches
      .filter(
        (match) =>
          match.status === MatchStatus.SCHEDULED &&
          new Date(match.matchDate).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      )[0];
  }, [matches]);

  const stats = useMemo(
    () => buildStats(matches, currentClubId ?? undefined),
    [matches, currentClubId],
  );

  // Mở modal hoac khung thao tác.
  const openLineupModal = async (match: MatchModel) => {
    if (!currentClubId || !match.id) {
      setError("Không xác định được câu lạc bộ hiện tại.");
      return;
    }

    try {
      const response = await MatchService.getTeamSeasonByMatchAndTeam(
        match.id,
        currentClubId,
      );

      setSelectedTeamSeasonId(Number(response.data.teamSeasonId));
      setSelectedMatch(match);
      setModalMode("edit");
    } catch (error) {
      console.error("Cannot get teamSeasonId", error);
      setError("Không thể xác định đội bóng trong mùa giải của trận đấu này.");
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader nextMatch={nextMatch} teamName={teamName} />

        <MatchTabs
          active={statusFilter}
          counts={statusCounts}
          onChange={setStatusFilter}
        />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner
            message="Đang tải danh sách trận đấu"
            description="Hệ thống đang lấy các trận của câu lạc bộ hiện tại để bạn cập nhật đội hình nhanh hơn."
            fullHeight
          />
        ) : filteredMatches.length === 0 ? (
          <EmptyState label={statusConfig[statusFilter].label} />
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {filteredMatches.map((match) => (
              <MatchCardItem
                key={match.id}
                match={match}
                onOpen={openLineupModal}
              />
            ))}
          </div>
        )}

        <PerformanceStats stats={stats} />
      </div>

      <Modal
        open={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        size="full"
      >
        {selectedMatch && (
          <MatchLineupModal
            match={selectedMatch}
            mode={modalMode}
            teamId={currentClubId || 0}
            teamName={teamName}
            teamSeasonId={selectedTeamSeasonId ?? 0}
            onClose={() => setSelectedMatch(null)}
            onSaved={fetchMatches}
          />
        )}
      </Modal>
    </AppLayout>
  );
};

export default MatchManagePageClub;

// Hiển thị PageHeader.
function PageHeader({
  nextMatch,
  teamName,
}: {
  nextMatch?: MatchModel;
  teamName: string;
}) {
  const countdown = getCountdown(nextMatch?.matchDate);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-['Be_Vietnam_Pro'] text-4xl font-black leading-tight text-gray-900">
          Quản lý Trận đấu
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Theo dõi lịch thi đấu và cập nhật đội hình ra sân cho {teamName}.
        </p>
      </div>

      <div className="flex min-w-fit items-center gap-5 rounded-[2rem] border border-gray-100 bg-white px-6 py-5 shadow-lg shadow-gray-900/5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f5f3ef]">
          <span className="material-symbols-outlined text-3xl text-[#008C2F]">
            timer
          </span>
        </div>

        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-wider text-indigo-600">
            Trận tiếp theo
          </p>

          {nextMatch ? (
            <>
              <div className="flex items-end gap-2 font-['Be_Vietnam_Pro'] text-2xl font-black text-gray-900">
                <TimeUnit value={countdown.days} unit="N" />
                <span className="pb-1 text-gray-300">:</span>
                <TimeUnit value={countdown.hours} unit="G" />
                <span className="pb-1 text-gray-300">:</span>
                <TimeUnit value={countdown.minutes} unit="P" />
              </div>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {getHomeTeamName(nextMatch)} vs {getAwayTeamName(nextMatch)}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-gray-500">
              Chưa có trận sắp diễn ra
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Hiển thị TimeUnit.
function TimeUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <span>
      {value}
      <span className="ml-1 text-xs font-bold text-gray-500">{unit}</span>
    </span>
  );
}

// Hiển thị MatchTabs.
function MatchTabs({
  active,
  counts,
  onChange,
}: {
  active: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (status: StatusFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-none border border-gray-100 bg-white p-2">
      {(Object.keys(statusConfig) as StatusFilter[]).map((status) => {
        const selected = active === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`whitespace-nowrap rounded-sm px-5 py-2.5 text-sm transition ${
              selected
                ? "bg-[#008C2F] font-black text-white shadow-md shadow-green-900/10"
                : "bg-transparent font-medium text-gray-500 hover:bg-[#f5f3ef] hover:text-gray-900"
            }`}
          >
            {statusConfig[status].label}
            <span
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${
                selected ? "bg-white/20 text-white" : statusConfig[status].badge
              }`}
            >
              {counts[status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Hiển thị MatchCardItem.
function MatchCardItem({
  match,
  onOpen,
}: {
  match: MatchModel;
  onOpen: (match: MatchModel) => void;
}) {
  const navigate = useNavigate();
  const isEditable = match.status === MatchStatus.SCHEDULED;
  const actionLabel = isEditable ? "Cập nhật đội hình" : "Xem chi tiết";
  const actionIcon = isEditable ? "edit_document" : "visibility";

  return (
    <article className="relative overflow-hidden rounded-none border border-gray-100 bg-white p-5 shadow-sm">
      {isEditable && (
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#008C2F] to-indigo-600" />
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <span
          className={`rounded-sm px-3 py-1 text-xs font-black uppercase tracking-wider ${
            isEditable
              ? "bg-indigo-50 text-indigo-700"
              : (statusConfig[match.status as StatusFilter]?.badge ??
                "bg-[#f5f3ef] text-gray-500")
          }`}
        >
          {getMatchCompetition(match)}
        </span>

        <span className="flex items-center gap-1 text-sm font-semibold text-gray-500">
          <span className="material-symbols-outlined text-sm">
            calendar_month
          </span>
          {formatDateTime(match.matchDate)}
        </span>
      </div>

      <div className="mb-7 flex items-center justify-between">
        <TeamBlock
          name={getHomeTeamName(match)}
          logo={getHomeTeamLogo(match)}
        />

        <div className="flex w-1/3 flex-col items-center justify-center">
          {match.status === MatchStatus.FINISHED ? (
            <span className="rounded-full bg-[#f5f3ef] px-5 py-2 font-['Be_Vietnam_Pro'] text-2xl font-black text-gray-700">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="rounded-full bg-[#f5f3ef] px-5 py-2 font-['Be_Vietnam_Pro'] text-2xl font-black text-gray-300">
              VS
            </span>
          )}

          <span className="mt-2 flex items-center gap-1 text-center text-xs font-semibold text-gray-400">
            <span className="material-symbols-outlined text-xs">stadium</span>
            {getMatchStadium(match) || "Chưa cập nhật sân"}
          </span>
        </div>

        <TeamBlock
          name={getAwayTeamName(match)}
          logo={getAwayTeamLogo(match)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            statusConfig[match.status as StatusFilter]?.badge ??
            "bg-stone-100 text-stone-500"
          }`}
        >
          {statusConfig[match.status as StatusFilter]?.label ?? match.status}
        </span>

        <button
          type="button"
          onClick={() =>
            isEditable ? onOpen(match) : navigate(`/matches/${match.id}`)
          }
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition ${
            isEditable
              ? "bg-[#008C2F] text-white hover:bg-green-800"
              : "bg-[#f5f3ef] text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {actionIcon}
          </span>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

// Hiển thị TeamBlock.
function TeamBlock({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex w-1/3 flex-col items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f3ef] p-2">
        <img
          src={logo || fallbackLogo}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      </div>

      <span className="text-center font-['Be_Vietnam_Pro'] text-base font-black text-gray-900">
        {name}
      </span>
    </div>
  );
}

// Hiển thị EmptyState.
function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-dashed border-gray-200 bg-white p-10 text-center">
      <span className="material-symbols-outlined text-4xl text-gray-300">
        event_busy
      </span>
      <p className="mt-3 font-['Be_Vietnam_Pro'] text-lg font-black text-gray-800">
        Không có trận {label.toLowerCase()}
      </p>
      {/* <p className="mt-1 text-sm text-gray-500">
        Dữ liệu sẽ hiển thị khi API trả về trận đấu thuộc câu lạc bộ hiện tại.
      </p> */}
    </div>
  );
}

// Hiển thị PerformanceStats.
function PerformanceStats({
  stats,
}: {
  stats: { winRate: string; goalsFor: string; goalsAgainst: string };
}) {
  return (
    <section className="space-y-5">
      {/* <h3 className="font-['Be_Vietnam_Pro'] text-xl font-black text-gray-900">
        Thống kê Phong độ
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="Tỉ lệ thắng"
          value={stats.winRate}
          icon="trending_up"
        />

        <StatCard label="Bàn thắng / Trận" value={stats.goalsFor} />

        <StatCard
          label="Thủng lưới / Trận"
          value={stats.goalsAgainst}
          icon="trending_down"
        />

        <button
          type="button"
          className="flex flex-col items-center justify-center rounded-none border border-gray-100 bg-white p-5 shadow-sm transition hover:bg-[#f5f3ef]"
        >
          <span className="material-symbols-outlined mb-1 text-3xl text-[#008C2F]">
            analytics
          </span>
          <span className="text-sm font-black text-gray-700">
            Báo cáo chi tiết
          </span>
        </button>
      </div> */}
    </section>
  );
}

// Hiển thị StatCard.
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div className="rounded-none border border-gray-100 bg-white p-5 shadow-sm">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-indigo-600">
        {label}
      </span>

      <div className="flex items-baseline gap-2">
        <span className="font-['Be_Vietnam_Pro'] text-3xl font-black text-gray-900">
          {value}
        </span>

        {icon && (
          <span className="material-symbols-outlined text-sm text-[#008C2F]">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

// Xử lý matches.
function extractMatches(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

// Chuẩn hóa match.
function normalizeMatch(raw: any): MatchModel | null {
  const id = Number(raw?.id ?? raw?.matchId);
  if (!id) return null;

  const homeTeam = raw?.homeTeam ?? {};
  const awayTeam = raw?.awayTeam ?? {};
  const homeTeamId = Number(
    homeTeam?.id ?? raw?.homeTeamId ?? raw?.home_team_id,
  );
  const awayTeamId = Number(
    awayTeam?.id ?? raw?.awayTeamId ?? raw?.away_team_id,
  );

  if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return null;

  return new MatchModel({
    id,
    status: (raw?.status ?? MatchStatus.SCHEDULED) as MatchStatus,
    matchDate: raw?.matchDate ?? raw?.dateTime ?? raw?.date ?? "",
    league: raw?.league,
    season: raw?.season,
    homeTeam: new TeamModel({
      ...homeTeam,
      id: homeTeamId,
      name: homeTeam?.name ?? raw?.homeTeamName ?? "Đội nhà",
      logo: homeTeam?.logo ?? raw?.homeTeamLogo ?? null,
      stadiumName:
        raw?.stadium?.name ??
        raw?.stadiumName ??
        homeTeam?.stadiumName ??
        homeTeam?.stadium ??
        null,
    }),
    awayTeam: new TeamModel({
      ...awayTeam,
      id: awayTeamId,
      name: awayTeam?.name ?? raw?.awayTeamName ?? "Đội khách",
      logo: awayTeam?.logo ?? raw?.awayTeamLogo ?? null,
      stadiumName: awayTeam?.stadiumName ?? awayTeam?.stadium ?? null,
    }),
    homeScore: raw?.homeScore,
    awayScore: raw?.awayScore,
  });
}

// Lấy home team id.
function getHomeTeamId(match: MatchModel) {
  return Number(match.homeTeam?.id ?? 0);
}

// Lấy away team id.
function getAwayTeamId(match: MatchModel) {
  return Number(match.awayTeam?.id ?? 0);
}

// Lấy home team name.
function getHomeTeamName(match: MatchModel) {
  return match.homeTeam?.name || "Đội nhà";
}

// Lấy away team name.
function getAwayTeamName(match: MatchModel) {
  return match.awayTeam?.name || "Đội khách";
}

// Lấy home team logo.
function getHomeTeamLogo(match: MatchModel) {
  return match.homeTeam?.logo || "";
}

// Lấy away team logo.
function getAwayTeamLogo(match: MatchModel) {
  return match.awayTeam?.logo || "";
}

// Lấy match stadium.
function getMatchStadium(match: MatchModel) {
  return match.homeTeam?.stadiumName || match.homeTeam?.stadium || "";
}

// Lấy match competition.
function getMatchCompetition(match: MatchModel) {
  const season = match.season as
    | (NonNullable<MatchModel["season"]> & { name?: string })
    | undefined;

  return (
    match.league?.name ||
    season?.name ||
    season?.year ||
    "Giải đấu chưa cập nhật"
  );
}

// Định dạng date time.
function formatDateTime(value: string | Date) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Lấy countdown.
function getCountdown(value?: string | Date) {
  if (!value) return { days: "00", hours: "00", minutes: "00" };
  const diff = Math.max(new Date(value).getTime() - Date.now(), 0);
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
}

// Tạo dữ liệu stats.
function buildStats(matches: MatchModel[], teamId?: number) {
  const finished = matches.filter(
    (match) =>
      match.status === MatchStatus.FINISHED &&
      match.homeScore != null &&
      match.awayScore != null,
  );

  if (finished.length === 0 || !teamId) {
    return { winRate: "0%", goalsFor: "0.0", goalsAgainst: "0.0" };
  }

  let wins = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  finished.forEach((match) => {
    const isHome = getHomeTeamId(match) === teamId;
    const forScore = Number(isHome ? match.homeScore : match.awayScore) || 0;
    const againstScore =
      Number(isHome ? match.awayScore : match.homeScore) || 0;

    goalsFor += forScore;
    goalsAgainst += againstScore;
    if (forScore > againstScore) wins += 1;
  });

  return {
    winRate: `${Math.round((wins / finished.length) * 100)}%`,
    goalsFor: (goalsFor / finished.length).toFixed(1),
    goalsAgainst: (goalsAgainst / finished.length).toFixed(1),
  };
}
