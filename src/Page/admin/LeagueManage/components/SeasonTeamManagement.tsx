import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../../../components/ConfirmModal";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import type { SeasonTeam } from "../../../../model/SeasonTeam";
import SeasonService from "../../../../services/SeasonService";
import SeasonTeamService from "../../../../services/SeasonTeamService";
import { getErrorMessage } from "../../../../utils/errorUtils";
import { PhanTrang } from "../../../../utils/PhanTrang";

type SeasonTeamManagementProps = {
  seasonId?: number;
  seasonName?: string;
  maxTeams?: number | null;
};

type PendingStatusUpdate = {
  id: number;
  teamName: string;
  nextStatus: "ACTIVE" | "INACTIVE";
} | null;

const fallbackLogo =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=120&h=120&fit=crop";
const PAGE_SIZE = 10;

// Hiển thị quản lý đội tham gia mùa giải.
export default function SeasonTeamManagement({
  seasonId,
  seasonName,
  maxTeams,
}: SeasonTeamManagementProps) {
  const [rows, setRows] = useState<SeasonTeam[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(
    seasonId ? String(seasonId) : "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingStatusUpdate, setPendingStatusUpdate] =
    useState<PendingStatusUpdate>(null);

  const effectiveSeasonId = seasonId
    ? seasonId
    : selectedSeasonId !== "ALL"
      ? Number(selectedSeasonId)
      : undefined;

  const loadSeasonTeams = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await SeasonTeamService.getAllSeasonTeams(
        currentPage - 1,
        PAGE_SIZE,
        { seasonId: effectiveSeasonId },
      );
      const data = response.data;

      setRows(readSeasonTeams(data));
      setTotalPages(Math.max(readTotalPages(data), 1));
      setTotalElements(readTotalElements(data));
    } catch (error) {
      console.error("Cannot load season teams", error);
      setRows([]);
      setTotalPages(1);
      setTotalElements(0);
      setErrorMessage(
        getErrorMessage(
          error,
          "Không thể tải danh sách đội tham gia mùa giải.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, effectiveSeasonId]);

  const loadSeasons = useCallback(async () => {
    if (seasonId) return;

    try {
      setSeasonLoading(true);
      const response = await SeasonService.getAllSeasons(0, 500);
      setSeasons(readArray(response.data));
    } catch (error) {
      console.warn("Cannot load seasons for season team filter", error);
      setSeasons([]);
    } finally {
      setSeasonLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    void loadSeasonTeams();
  }, [loadSeasonTeams]);

  useEffect(() => {
    void loadSeasons();
  }, [loadSeasons]);

  useEffect(() => {
    if (!seasonId) return;

    setSelectedSeasonId(String(seasonId));
    setCurrentPage(1);
  }, [seasonId]);

  const teamCountText =
    maxTeams != null && Number.isFinite(Number(maxTeams))
      ? `${totalElements} / ${maxTeams} đội`
      : seasonId
        ? `${totalElements} đội`
        : `${totalElements} lượt tham gia`;

  const handleRequestStatusUpdate = (
    row: SeasonTeam,
    nextStatus: "ACTIVE" | "INACTIVE",
  ) => {
    const id = Number(row.id);

    if (!Number.isFinite(id) || id <= 0) {
      toast.error("Không xác định được mã đội trong mùa giải.");
      return;
    }

    setPendingStatusUpdate({
      id,
      teamName: getTeamName(row),
      nextStatus,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    try {
      setUpdating(true);
      await SeasonTeamService.updateSeasonTeamStatus(
        pendingStatusUpdate.id,
        pendingStatusUpdate.nextStatus,
      );
      toast.success(
        pendingStatusUpdate.nextStatus === "ACTIVE"
          ? "Đã kích hoạt lại đội trong mùa giải."
          : "Đã vô hiệu hóa đội trong mùa giải.",
      );
      setPendingStatusUpdate(null);
      await loadSeasonTeams();
    } catch (error) {
      console.error("Cannot update season team status", error);
      toast.error(
        getErrorMessage(
          error,
          "Không thể cập nhật trạng thái đội trong mùa giải.",
        ),
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#E4E2DE] bg-[#F5F3EF] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#008C2F]">
              Season teams
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#1B1C1A]">
              {seasonId
                ? `Đội tham gia ${seasonName ? `- ${seasonName}` : ""}`
                : "Quản lý đội tham gia mùa giải"}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#707A6C]">
              Số đội tham gia:{" "}
              <span className="font-black text-[#0D631B]">{teamCountText}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSeasonTeams()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#40493D] shadow-sm transition hover:bg-[#E4E2DE] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Tải lại
          </button>
        </div>
      </div>

      {!seasonId && (
        <div className="rounded-[1.5rem] border border-[#E4E2DE] bg-white p-5 shadow-sm">
          <label className="block max-w-md">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
              Lọc theo mùa giải
            </span>
            <select
              value={selectedSeasonId}
              disabled={seasonLoading}
              onChange={(event) => {
                setSelectedSeasonId(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-full border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10 disabled:opacity-60"
            >
              <option value="ALL">Tất cả mùa giải</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {getSeasonOptionLabel(season)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <LoadingSpinner
          message="Đang tải danh sách đội tham gia"
          description="Hệ thống đang lấy các đội đã được gắn vào mùa giải này."
          fullHeight
        />
      ) : rows.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[#BFCABA] bg-white p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-[#0D631B]">
            groups
          </span>
          <p className="mt-3 text-sm font-black text-[#1B1C1A]">
            Chưa có đội tham gia mùa giải này
          </p>
          <p className="mt-1 text-xs font-medium text-[#707A6C]">
            Dữ liệu sẽ xuất hiện sau khi hồ sơ đăng ký được duyệt hoặc đội được
            gắn vào mùa giải.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-[#E4E2DE] bg-white">
          <div className="hidden grid-cols-12 bg-[#F5F3EF] px-5 py-3 text-xs font-black uppercase tracking-widest text-[#707A6C] md:grid">
            <div className="col-span-1">STT</div>
            <div className="col-span-4">Đội bóng</div>
            <div className="col-span-2">Mùa giải</div>
            <div className="col-span-2">Ngày tham gia</div>
            <div className="col-span-1">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          <div className="divide-y divide-[#E4E2DE]">
            {rows.map((row, index) => {
              const status = normalizeStatus(row.status);
              const isActive = status === "ACTIVE";
              const nextStatus = isActive ? "INACTIVE" : "ACTIVE";

              return (
                <div
                  key={row.id ?? `${getTeamName(row)}-${index}`}
                  className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-12 md:items-center"
                >
                  <div className="text-sm font-black text-[#707A6C] md:col-span-1">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </div>
                  <div className="flex items-center gap-3 md:col-span-4">
                    <img
                      src={getTeamLogo(row)}
                      alt={getTeamName(row)}
                      className="h-11 w-11 rounded-xl border border-[#E4E2DE] bg-[#F5F3EF] object-contain p-1"
                      onError={(event) => {
                        event.currentTarget.src = fallbackLogo;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1B1C1A]">
                        {getTeamName(row)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#707A6C]">
                        #{row.teamId ?? row.team?.id ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#40493D] md:col-span-2">
                    {getSeasonName(row, seasonName)}
                  </div>
                  <div className="text-sm font-bold text-[#40493D] md:col-span-2">
                    {formatDate(getJoinedDate(row))}
                  </div>
                  <div className="md:col-span-1">
                    <StatusPill status={status} />
                  </div>
                  <div className="flex md:col-span-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => handleRequestStatusUpdate(row, nextStatus)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-black transition ${
                        isActive
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-green-50 text-[#0D631B] hover:bg-green-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isActive ? "block" : "check_circle"}
                      </span>
                      {isActive ? "Vô hiệu hóa" : "Kích hoạt lại"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <PhanTrang
          tongSoTrang={totalPages}
          trangHienTai={currentPage}
          xuLyTrang={(page) => setCurrentPage(Number(page))}
        />
      )}

      <ConfirmModal
        open={pendingStatusUpdate !== null}
        title={
          pendingStatusUpdate?.nextStatus === "ACTIVE"
            ? "Kích hoạt lại đội"
            : "Vô hiệu hóa đội"
        }
        message={
          pendingStatusUpdate?.nextStatus === "ACTIVE"
            ? `Bạn có chắc muốn kích hoạt lại đội ${pendingStatusUpdate?.teamName ?? ""} trong mùa giải không?`
            : `Bạn có chắc muốn vô hiệu hóa đội ${pendingStatusUpdate?.teamName ?? ""} khỏi mùa giải không?`
        }
        confirmText={
          pendingStatusUpdate?.nextStatus === "ACTIVE"
            ? "Kích hoạt lại"
            : "Vô hiệu hóa"
        }
        cancelText="Hủy"
        danger={pendingStatusUpdate?.nextStatus === "INACTIVE"}
        loading={updating}
        onConfirm={handleConfirmStatusUpdate}
        onClose={() => {
          if (!updating) setPendingStatusUpdate(null);
        }}
      />
    </section>
  );
}

function readSeasonTeams(value: any): SeasonTeam[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.content)) return value.data.content;
  return [];
}

function readArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.content)) return value.data.content;
  return [];
}

function readTotalPages(value: any): number {
  const totalPages =
    value?.totalPages ?? value?.data?.totalPages ?? value?.page?.totalPages;

  if (Number.isFinite(Number(totalPages))) {
    return Number(totalPages);
  }

  return Math.ceil(readSeasonTeams(value).length / PAGE_SIZE);
}

function readTotalElements(value: any): number {
  const totalElements =
    value?.totalElements ??
    value?.data?.totalElements ??
    value?.page?.totalElements;

  if (Number.isFinite(Number(totalElements))) {
    return Number(totalElements);
  }

  return readSeasonTeams(value).length;
}

function normalizeStatus(status?: string | null) {
  return String(status ?? "ACTIVE").toUpperCase();
}

function getTeamName(row: SeasonTeam) {
  return row.team?.name ?? row.teamName ?? "Chưa rõ đội";
}

function getTeamLogo(row: SeasonTeam) {
  return row.team?.logo ?? row.teamLogo ?? fallbackLogo;
}

function getSeasonName(row: SeasonTeam, fallback?: string) {
  return (
    row.season?.name ??
    row.season?.year ??
    row.seasonName ??
    fallback ??
    "Chưa có dữ liệu"
  );
}

function getSeasonOptionLabel(season: any) {
  return (
    season.name ||
    season.year ||
    season.seasonName ||
    `Mùa giải #${season.id ?? "N/A"}`
  );
}

function getJoinedDate(row: SeasonTeam) {
  return row.joinedAt ?? row.createdAt ?? row.assignedDate ?? null;
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function StatusPill({ status }: { status?: string | null }) {
  const active = normalizeStatus(status) === "ACTIVE";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        active
          ? "bg-[#B2F746]/30 text-[#0D631B]"
          : "bg-[#F0EEEA] text-[#707A6C]"
      }`}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}
