import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../../components/ConfirmModal";
import { Modal } from "../../../components/Modal";
import AddClubModal from "./AddClubModal";
import { AppLayout } from "../../../layouts/AppLayout";
import { TeamModel } from "../../../model/TeamModel";
import TeamService from "../../../services/TeamService";
import { PhanTrang } from "../../../utils/PhanTrang";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";
import { getErrorMessage } from "../../../utils/errorUtils";

type FilterState = {
  search: string;
  city: string;
  region: string;
  status: string;
};

const PAGE_SIZE = 9;

const DEFAULT_FILTERS: FilterState = {
  search: "",
  city: "",
  region: "Tất cả khu vực",
  status: "Tất cả trạng thái",
};

const REGION_FILTERS = ["Tất cả khu vực", "Bắc", "Trung", "Nam"] as const;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

// Chuẩn hóa keyword.
const normalizeKeyword = (value: string) => value.trim().toLowerCase();
// Lấy status label.
const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;

const ClubManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamModel | null>(null);
  const [teams, setTeams] = useState<TeamModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<TeamModel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const hasLocalFilters = useMemo(
    () =>
      appliedFilters.region !== "Tất cả khu vực" ||
      appliedFilters.status !== "Tất cả trạng thái",
    [appliedFilters],
  );

  // Xử lý teams on client.
  const filterTeamsOnClient = (items: TeamModel[], filters: FilterState) => {
    const keyword = normalizeKeyword(filters.search);
    const cityKeyword = normalizeKeyword(filters.city);

    return items.filter((team) => {
      const matchesSearch =
        !keyword ||
        normalizeKeyword(team.name).includes(keyword) ||
        normalizeKeyword(team.owner).includes(keyword) ||
        normalizeKeyword(team.stadiumName ?? "").includes(keyword);

      const matchesCity =
        !cityKeyword || normalizeKeyword(team.city).includes(cityKeyword);

      const matchesRegion =
        filters.region === "Tất cả khu vực" || team.region === filters.region;

      const matchesStatus =
        filters.status === "Tất cả trạng thái" ||
        team.status === filters.status;

      return matchesSearch && matchesCity && matchesRegion && matchesStatus;
    });
  };

  const fetchTeams = useCallback(
    async (page = 1, filters = appliedFilters) => {
      setIsLoading(true);

      try {
        if (
          filters.region !== "Tất cả khu vực" ||
          filters.status !== "Tất cả trạng thái"
        ) {
          const baseResponse = await TeamService.getAllTeamsNormalized(
            0,
            1,
            filters,
          );
          const totalElements = baseResponse.totalElements ?? 0;
          const fetchSize = Math.max(totalElements, 1);
          const fullResponse = await TeamService.getAllTeamsNormalized(
            0,
            fetchSize,
            filters,
          );

          const clientFiltered = filterTeamsOnClient(
            fullResponse.content ?? [],
            filters,
          );
          const totalPages = Math.ceil(clientFiltered.length / PAGE_SIZE);
          const safePage =
            totalPages === 0 ? 1 : Math.min(page, Math.max(totalPages, 1));
          const startIndex = (safePage - 1) * PAGE_SIZE;

          setTeams(clientFiltered.slice(startIndex, startIndex + PAGE_SIZE));
          setTongSoPhanTu(clientFiltered.length);
          setTongSoTrang(totalPages);
          setTrangHienTai(safePage);
          return;
        }

        const data = await TeamService.getAllTeamsNormalized(
          page - 1,
          PAGE_SIZE,
          filters,
        );
        setTeams(data.content ?? []);
        setTongSoTrang(data.totalPages ?? 0);
        setTongSoPhanTu(data.totalElements ?? 0);
        setTrangHienTai((data.number ?? page - 1) + 1);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đội bóng:", error);
        setTeams([]);
        setTongSoTrang(0);
        setTongSoPhanTu(0);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    fetchTeams(trangHienTai, appliedFilters);
  }, [fetchTeams, trangHienTai, appliedFilters]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (event.action === "REFETCH_TEAMS") {
        void fetchTeams(trangHienTai, appliedFilters);
      }
    },
    [appliedFilters, fetchTeams, trangHienTai],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý apply filters.
  const applyFilters = () => {
    setTrangHienTai(1);
    setAppliedFilters({
      ...draftFilters,
      search: draftFilters.search.trim(),
      city: draftFilters.city.trim(),
    });
  };

  // Xử lý filters.
  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setTrangHienTai(1);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  // Xử lý xóa dữ liệu.
  const handleDelete = async (team: TeamModel) => {
    if (!team.id) return;
    setDeletingTeam(team);
  };

  // Xử lý xóa dữ liệu.
  const handleConfirmDelete = async () => {
    if (!deletingTeam?.id) return;

    try {
      setDeleteLoading(true);
      await TeamService.deleteTeam(deletingTeam.id);
      toast.success("Đã xóa đội bóng.");
      setDeletingTeam(null);
      fetchTeams(trangHienTai, appliedFilters);
    } catch (error) {
      console.error("Lỗi khi xóa đội bóng:", error);
      toast.error(getErrorMessage(error, "Không thể xóa đội bóng này."));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Mở modal hoac khung thao tác.
  const openCreateModal = () => {
    setSelectedTeam(null);
    setOpen(true);
  };

  // Mở modal hoac khung thao tác.
  const openEditModal = (team: TeamModel) => {
    setSelectedTeam(team);
    setOpen(true);
  };

  return (
    <AppLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-4xl font-black tracking-tight font-['Be_Vietnam_Pro']">
            Quản lý Câu lạc bộ
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0d631b]" />
            <p className="font-medium text-gray-500">Quản lý đội bóng.</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-[#0d631b] px-8 py-4 font-bold text-white shadow-lg shadow-green-900/20 transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Thêm CLB mới
        </button>
      </header>

      <div className="mb-8 rounded-2xl bg-[#f5f3ef] p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1.5 xl:col-span-2">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Tìm kiếm
            </label>
            <input
              name="search"
              value={draftFilters.search}
              onChange={handleFilterChange}
              placeholder="Tên đội, chủ sở hữu, sân vận động..."
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d631b]/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Thành phố
            </label>
            <input
              name="city"
              value={draftFilters.city}
              onChange={handleFilterChange}
              placeholder="Ví dụ: TP. Hồ Chí Minh"
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d631b]/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Khu vực
            </label>
            <select
              name="region"
              value={draftFilters.region}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none"
            >
              {REGION_FILTERS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Trạng thái
            </label>
            <select
              name="status"
              value={draftFilters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="Tất cả trạng thái">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={resetFilters}
            className="rounded-lg border border-[#0d631b]/15 bg-white px-5 py-2.5 font-semibold text-[#0d631b] transition hover:bg-[#0d631b]/5"
          >
            Đặt lại
          </button>
          <button
            onClick={applyFilters}
            className="rounded-lg bg-[#4c56af] px-6 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <SkeletonCard key={`team-loading-${index}`} />
          ))
        ) : teams.length > 0 ? (
          teams.map((team) => (
            <ClubCard
              key={team.id}
              team={team}
              onEdit={() => openEditModal(team)}
              onDelete={() => handleDelete(team)}
            />
          ))
        ) : (
          <EmptyState />
        )}

        {/* {!isLoading && (
          <button
            onClick={openCreateModal}
            className="group flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition-all hover:border-[#0d631b]/30 hover:bg-white"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#0d631b] transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined">add</span>
            </div>
            <h4 className="font-bold font-['Be_Vietnam_Pro']">
              Tạo Câu Lạc Bộ Mới
            </h4>
            <p className="mt-2 max-w-[220px] text-xs text-gray-400">
              Khởi tạo đội bóng mới trực tiếp từ trang quản lý.
            </p>
          </button>
        )} */}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2 flex items-center gap-6 rounded-2xl border border-green-100/50 bg-green-50/50 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0d631b] text-white">
            <span className="material-symbols-outlined text-3xl">
              analytics
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-green-800/60">
              Tổng số CLB
            </h4>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black font-['Be_Vietnam_Pro']">
                {tongSoPhanTu}
              </span>
              <span className="mb-1 text-sm font-bold text-[#0d631b]">
                {hasLocalFilters ? "sau bộ lọc" : "toàn hệ thống"}
              </span>
            </div>
          </div>
        </div>
        <StatCard
          label="Trang hiện tại"
          value={String(trangHienTai)}
          sub={`Tổng ${tongSoTrang} trang`}
        />
        <StatCard
          label="Hệ thống"
          value="Ổn định"
          sub="Đồng bộ dữ liệu"
          isStatus
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
        <p className="text-sm font-medium text-[#40493d]">
          Hiển thị{" "}
          <span className="font-bold">
            {tongSoPhanTu === 0
              ? "0"
              : `${(trangHienTai - 1) * PAGE_SIZE + 1} - ${Math.min(
                  trangHienTai * PAGE_SIZE,
                  tongSoPhanTu,
                )}`}
          </span>{" "}
          trong số <span className="font-bold">{tongSoPhanTu}</span> câu lạc bộ
        </p>
        <PhanTrang
          tongSoTrang={tongSoTrang}
          trangHienTai={trangHienTai}
          xuLyTrang={(page) => setTrangHienTai(Number(page))}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddClubModal
          onClose={() => setOpen(false)}
          currentTeam={selectedTeam}
          onSuccess={() => fetchTeams(trangHienTai, appliedFilters)}
        />
      </Modal>
      <ConfirmModal
        open={deletingTeam !== null}
        title="Xóa đội bóng"
        message={`Bạn có chắc chắn muốn xóa đội bóng ${deletingTeam?.name ?? ""}?`}
        confirmText="Xóa đội"
        cancelText="Hủy"
        danger
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleteLoading) setDeletingTeam(null);
        }}
      />
    </AppLayout>
  );
};

const ClubCard = ({
  team,
  onEdit,
  onDelete,
}: {
  team: TeamModel;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div
    className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 ${
      team.status !== "ACTIVE" ? "grayscale opacity-60" : ""
    }`}
  >
    <div className="mb-6 flex items-start justify-between">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 ring-4 ring-[#fbf9f5]">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-3xl text-gray-400">
            shield
          </span>
        )}
      </div>
      <span
        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
          team.status === "ACTIVE"
            ? "bg-green-100 text-[#0d631b]"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {getStatusLabel(team.status)}
      </span>
    </div>

    <h3 className="mb-4 text-xl font-bold transition-colors group-hover:text-[#0d631b] font-['Be_Vietnam_Pro']">
      {team.name}
    </h3>

    <div className="mb-6 space-y-3">
      {/* <div className="inline-flex items-center rounded-full bg-[#0d631b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0d631b]">
        {team.region} • {team.city}
      </div> */}
      <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
        <span className="material-symbols-outlined text-sm opacity-60">
          stadium
        </span>
        {team.stadiumName || "Chưa có sân vận động"}
      </div>
      <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
        <span className="material-symbols-outlined text-sm opacity-60">
          calendar_today
        </span>
        Thành lập: {team.establishedYear || "Chưa cập nhật"}
      </div>
      <div className="flex items-center gap-3 text-sm font-bold text-[#4c56af]">
        <span className="material-symbols-outlined text-sm opacity-60">
          business
        </span>
        {team.owner || "Chưa cập nhật chủ sở hữu"}
      </div>
      <p className="line-clamp-2 text-sm text-gray-500">
        {team.description || "Chưa có mô tả đội bóng."}
      </p>
    </div>

    <div className="flex gap-2 border-t border-gray-50 pt-4">
      <button
        onClick={onEdit}
        className="flex-1 rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-600 transition-all hover:bg-[#4c56af] hover:text-white"
      >
        Chỉnh sửa
      </button>
      <button
        onClick={onEdit}
        className="rounded-full bg-gray-100 p-2.5 text-gray-600 hover:bg-gray-200"
      >
        <span className="material-symbols-outlined text-sm">edit</span>
      </button>
      <button
        onClick={onDelete}
        className="rounded-full bg-red-50 p-2.5 text-red-500 transition-all hover:bg-red-500 hover:text-white"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  </div>
);

// Hiển thị SkeletonCard.
const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
    <div className="mb-6 flex items-start justify-between">
      <div className="h-16 w-16 rounded-2xl bg-gray-200" />
      <div className="h-6 w-24 rounded-full bg-gray-200" />
    </div>
    <div className="mb-4 h-6 w-2/3 rounded bg-gray-200" />
    <div className="space-y-3">
      <div className="h-6 w-32 rounded-full bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-5/6 rounded bg-gray-200" />
      <div className="h-4 w-4/6 rounded bg-gray-200" />
    </div>
  </div>
);

// Hiển thị EmptyState.
const EmptyState = () => (
  <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
    Không có đội bóng phù hợp với bộ lọc hiện tại.
  </div>
);

const StatCard = ({
  label,
  value,
  sub,
  isStatus = false,
}: {
  label: string;
  value: string;
  sub: string;
  isStatus?: boolean;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </h4>
    {isStatus ? (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#0d631b]" />
        <span className="text-xl font-black text-[#0d631b] font-['Be_Vietnam_Pro']">
          {value}
        </span>
      </div>
    ) : (
      <span className="text-2xl font-black font-['Be_Vietnam_Pro']">
        {value}
      </span>
    )}
    <p className="mt-1 text-xs font-medium text-gray-400">{sub}</p>
  </div>
);

export default ClubManagement;
