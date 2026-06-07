import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateTournament from "./CreateTournament";
import CreateSeasonModal from "./CreateSeasonModal";

import ConfirmModal from "../../../components/ConfirmModal";
import { Modal } from "../../../components/Modal";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { AppLayout } from "../../../layouts/AppLayout";
import LeagueService from "../../../services/LeagueService";
import SeasonService from "../../../services/SeasonService";
import SystemRuleService from "../../../services/SystemRuleService";
import { PhanTrang } from "../../../utils/PhanTrang";
import { League } from "../../../model/LeagueModel";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";
import { getErrorMessage } from "../../../utils/errorUtils";

type FilterState = {
  search: string;
  scale: string;
  status: string;
};

type LeagueWithSeasons = {
  league: League;
  seasons: Array<any>;
};

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FilterState = {
  search: "",
  scale: "Tất cả quy mô",
  status: "Tất cả trạng thái",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

// Chuẩn hóa keyword.
const normalizeKeyword = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

// Lấy status label.
const getStatusLabel = (status?: string | null) =>
  status ? (STATUS_LABELS[status] ?? status) : "Chưa cập nhật";

// Lấy season status.
const getSeasonStatus = (season: any) => {
  const now = new Date();
  const start = season.startDate ? new Date(season.startDate) : null;
  const end = season.endDate ? new Date(season.endDate) : null;

  if (start && now < start) return "Sắp diễn ra";
  if (end && now > end) return "Đã kết thúc";
  if (start && end && now >= start && now <= end) return "Đang diễn ra";
  return "Chưa rõ";
};

// Định dạng date.
const formatDate = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const TournamentManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [items, setItems] = useState<LeagueWithSeasons[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingLeague, setDeletingLeague] = useState<League | null>(null);
  const [deletingSeasonId, setDeletingSeasonId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null);
  const [seasonLeagueId, setSeasonLeagueId] = useState<number | null>(null);

  const hasClientFilters = useMemo(
    () =>
      appliedFilters.scale !== "Tất cả quy mô" ||
      appliedFilters.status !== "Tất cả trạng thái",
    [appliedFilters],
  );

  const filterClientItems = useCallback(
    (leagues: LeagueWithSeasons[], filters: FilterState) => {
      const keyword = normalizeKeyword(filters.search);

      return leagues.filter(({ league }) => {
        const matchesSearch =
          !keyword ||
          normalizeKeyword(league.name).includes(keyword) ||
          normalizeKeyword(league.country).includes(keyword);

        const matchesScale =
          filters.scale === "Tất cả quy mô" || league.scale === filters.scale;

        const matchesStatus =
          filters.status === "Tất cả trạng thái" ||
          league.status === filters.status;

        return matchesSearch && matchesScale && matchesStatus;
      });
    },
    [],
  );

  const fetchLeagueSeasons = useCallback(async (leagueId?: number) => {
    if (!leagueId) return [];

    try {
      return await LeagueService.getSeasonsByLeague(leagueId);
    } catch (error) {
      console.error(`Lỗi khi tải mùa giải cho league ${leagueId}:`, error);
      return [];
    }
  }, []);

  const enrichLeagues = useCallback(
    async (leagues: League[]) => {
      const seasonsList = await Promise.all(
        leagues.map((league) => fetchLeagueSeasons(league.id)),
      );

      return leagues.map((league, index) => ({
        league,
        seasons: seasonsList[index] ?? [],
      }));
    },
    [fetchLeagueSeasons],
  );

  const fetchLeagues = useCallback(
    async (page = 1, filters = appliedFilters) => {
      setIsLoading(true);

      try {
        if (
          filters.scale !== "Tất cả quy mô" ||
          filters.status !== "Tất cả trạng thái"
        ) {
          const baseResponse = await LeagueService.getAllLeaguesNormalized(
            0,
            1,
            filters.search,
          );
          const totalElements = baseResponse.totalElements ?? 0;
          const fetchSize = Math.max(totalElements, 1);
          const fullResponse = await LeagueService.getAllLeaguesNormalized(
            0,
            fetchSize,
            filters.search,
          );
          const fullItems = await enrichLeagues(fullResponse.content ?? []);
          const clientFiltered = filterClientItems(fullItems, filters);
          const totalPages = Math.ceil(clientFiltered.length / PAGE_SIZE);
          const safePage =
            totalPages === 0 ? 1 : Math.min(page, Math.max(totalPages, 1));
          const startIndex = (safePage - 1) * PAGE_SIZE;

          setItems(clientFiltered.slice(startIndex, startIndex + PAGE_SIZE));
          setTongSoPhanTu(clientFiltered.length);
          setTongSoTrang(totalPages);
          setTrangHienTai(safePage);
          return;
        }

        const data = await LeagueService.getAllLeaguesNormalized(
          page - 1,
          PAGE_SIZE,
          filters.search,
        );
        const enriched = await enrichLeagues(data.content ?? []);

        setItems(enriched);
        setTongSoTrang(data.totalPages ?? 0);
        setTongSoPhanTu(data.totalElements ?? 0);
        setTrangHienTai((data.number ?? page - 1) + 1);
      } catch (error) {
        console.error("Lỗi khi tải giải đấu:", error);
        setItems([]);
        setTongSoTrang(0);
        setTongSoPhanTu(0);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, enrichLeagues, filterClientItems],
  );

  useEffect(() => {
    fetchLeagues(trangHienTai, appliedFilters);
  }, [fetchLeagues, trangHienTai, appliedFilters]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_LEAGUES" ||
        event.action === "REFETCH_SEASONS" ||
        event.action === "REFETCH_ROUNDS" ||
        event.action === "REFETCH_SEASON_TEAMS"
      ) {
        void fetchLeagues(trangHienTai, appliedFilters);
      }
    },
    [appliedFilters, fetchLeagues, trangHienTai],
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
    setAppliedFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  // Xử lý filters.
  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setTrangHienTai(1);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  // Xử lý xóa dữ liệu.
  const handleDelete = async (league: League) => {
    if (!league.id) return;
    setDeletingLeague(league);
  };

  // Xử lý xóa dữ liệu.
  const handleConfirmDeleteLeague = async () => {
    if (!deletingLeague?.id) return;

    try {
      setDeleteLoading(true);
      await LeagueService.deleteLeague(deletingLeague.id);
      toast.success("Đã xóa giải đấu.");
      setDeletingLeague(null);
      fetchLeagues(trangHienTai, appliedFilters);
    } catch (error) {
      console.error("Lỗi khi xóa giải đấu:", error);
      toast.error(getErrorMessage(error, "Không thể xóa giải đấu này."));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xử lý xóa dữ liệu.
  const handleDeleteSeason = async (seasonId: number) => {
    setDeletingSeasonId(seasonId);
  };

  // Xử lý xóa dữ liệu.
  const handleConfirmDeleteSeason = async () => {
    if (!deletingSeasonId) return;

    try {
      setDeleteLoading(true);
      await SeasonService.deleteSeason(deletingSeasonId);
      toast.success("Đã xóa mùa giải.");
      setDeletingSeasonId(null);
      fetchLeagues(trangHienTai, appliedFilters);
    } catch (error) {
      console.error("Lỗi khi xóa mùa giải:", error);
      toast.error(
        getErrorMessage(
          error,
          "Không thể xóa mùa giải này. Vui lòng kiểm tra xem có hồ sơ đăng ký hoặc trận đấu liên quan không.",
        ),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeCount = useMemo(
    () => items.filter((item) => item.league.status === "ACTIVE").length,
    [items],
  );

  const seasonCount = useMemo(
    () => items.reduce((sum, item) => sum + item.seasons.length, 0),
    [items],
  );

  const upcomingSeasonCount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.seasons.filter(
            (season) => getSeasonStatus(season) === "Sắp diễn ra",
          ).length,
        0,
      ),
    [items],
  );

  return (
    <AppLayout>
      <div>
        <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
              League operations
            </p>

            <h1 className="font-['Be_Vietnam_Pro'] text-4xl font-black tracking-tight text-[#1B1C1A] md:text-5xl">
              Quản lý giải đấu
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#707A6C]">
              Quản lý theo luồng League → Season. Mở từng giải đấu để tạo mùa
              giải, gán bộ luật và theo dõi trạng thái vận hành.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setSelectedLeague(null);
                setOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D631B] px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#00490E]"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo giải đấu
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Giải đang hoạt động"
            value={String(activeCount)}
            desc="Theo dữ liệu đang hiển thị"
            icon="military_tech"
            accent="green"
          />
          <StatCard
            title="Tổng mùa giải"
            value={String(seasonCount)}
            desc="Tổng season trong các league hiện tại"
            icon="stadium"
            accent="lime"
          />
          <StatCard
            title="Sắp diễn ra"
            value={String(upcomingSeasonCount)}
            desc="Season có ngày bắt đầu trong tương lai"
            icon="event_upcoming"
            accent="amber"
          />
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#E4E2DE] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <label className="lg:col-span-5">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
                Tìm kiếm
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#707A6C]">
                  search
                </span>
                <input
                  name="search"
                  value={draftFilters.search}
                  onChange={handleFilterChange}
                  className="w-full rounded-full border border-transparent bg-[#F5F3EF] py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
                  placeholder="Tìm theo tên giải đấu hoặc quốc gia..."
                />
              </div>
            </label>

            <FilterSelect
              label="Quy mô"
              name="scale"
              value={draftFilters.scale}
              onChange={handleFilterChange}
              options={["Tất cả quy mô", "Quốc gia", "Khu vực", "Quốc tế"]}
            />

            <FilterSelect
              label="Trạng thái"
              name="status"
              value={draftFilters.status}
              onChange={handleFilterChange}
              options={[
                "Tất cả trạng thái",
                { label: "Đang hoạt động", value: "ACTIVE" },
                { label: "Ngừng hoạt động", value: "INACTIVE" },
              ]}
            />

            <div className="flex gap-3 lg:col-span-3 lg:justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 rounded-full bg-[#F0EEEA] px-4 py-3 text-sm font-black text-[#40493D] transition hover:bg-[#E4E2DE] lg:flex-none"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 rounded-full bg-[#1B1C1A] px-5 py-3 text-sm font-black text-white transition hover:bg-black lg:flex-none"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {hasClientFilters && (
            <div className="mt-4 rounded-[1rem] bg-[#B2F746]/20 px-4 py-3 text-xs font-bold text-[#496F00]">
              {/* Đang dùng bộ lọc phía client cho quy mô hoặc trạng thái. */}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="hidden grid-cols-12 px-6 py-2 text-xs font-black uppercase tracking-widest text-[#707A6C] md:grid">
            <div className="col-span-4">Tên giải đấu</div>
            <div className="col-span-2">Quốc gia</div>
            <div className="col-span-2">Mùa giải</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {isLoading ? (
            <LoadingSpinner
              message="Đang tải danh sách giải đấu"
              description="Các giải đấu và mùa giải liên quan đang được đồng bộ từ hệ thống."
              fullHeight
            />
          ) : items.length > 0 ? (
            items.map((item) => (
              <TournamentRow
                key={item.league.id}
                item={item}
                onEdit={() => {
                  setSelectedLeague(item.league);
                  setOpen(true);
                }}
                onDelete={() => handleDelete(item.league)}
                onAddSeason={(leagueId) => {
                  setSelectedSeason(null);
                  setSeasonLeagueId(leagueId);
                  setSeasonModalOpen(true);
                }}
                onEditSeason={(season) => {
                  setSelectedSeason(season);
                  setSeasonLeagueId(season.leagueId ?? item.league.id ?? null);
                  setSeasonModalOpen(true);
                }}
                onDeleteSeason={handleDeleteSeason}
              />
            ))
          ) : (
            <EmptyState
              onCreate={() => {
                setSelectedLeague(null);
                setOpen(true);
              }}
            />
          )}
        </section>

        <div className="mt-8 flex flex-col gap-4 border-t border-black/5 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-[#40493D]">
            Hiển thị{" "}
            <span className="font-black">
              {tongSoPhanTu === 0
                ? "0"
                : `${(trangHienTai - 1) * PAGE_SIZE + 1} - ${Math.min(
                    trangHienTai * PAGE_SIZE,
                    tongSoPhanTu,
                  )}`}
            </span>{" "}
            trong số <span className="font-black">{tongSoPhanTu}</span> giải đấu
          </p>
          <PhanTrang
            tongSoTrang={tongSoTrang}
            trangHienTai={trangHienTai}
            xuLyTrang={(page) => setTrangHienTai(Number(page))}
          />
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} size="xl">
        <CreateTournament
          onClose={() => setOpen(false)}
          currentLeague={selectedLeague}
          onSuccess={() => fetchLeagues(trangHienTai, appliedFilters)}
        />
      </Modal>

      <Modal
        open={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        size="xl"
      >
        <CreateSeasonModal
          onClose={() => setSeasonModalOpen(false)}
          leagueId={seasonLeagueId || 0}
          currentSeason={selectedSeason}
          onSuccess={() => fetchLeagues(trangHienTai, appliedFilters)}
        />
      </Modal>
      <ConfirmModal
        open={deletingLeague !== null}
        title="Xóa giải đấu"
        message={`Bạn có chắc chắn muốn xóa giải đấu ${deletingLeague?.name ?? ""}?`}
        confirmText="Xóa giải đấu"
        cancelText="Hủy"
        danger
        loading={deleteLoading}
        onConfirm={handleConfirmDeleteLeague}
        onClose={() => {
          if (!deleteLoading) setDeletingLeague(null);
        }}
      />
      <ConfirmModal
        open={deletingSeasonId !== null}
        title="Xóa mùa giải"
        message="Bạn có chắc chắn muốn xóa mùa giải này không?"
        confirmText="Xóa mùa giải"
        cancelText="Hủy"
        danger
        loading={deleteLoading}
        onConfirm={handleConfirmDeleteSeason}
        onClose={() => {
          if (!deleteLoading) setDeletingSeasonId(null);
        }}
      />
    </AppLayout>
  );
};

const TournamentRow: React.FC<{
  item: LeagueWithSeasons;
  onEdit: () => void;
  onDelete: () => void;
  onAddSeason: (leagueId: number) => void;
  onEditSeason: (season: any) => void;
  onDeleteSeason: (seasonId: number) => void;
}> = ({
  item,
  onEdit,
  onDelete,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
}) => {
  const { league, seasons } = item;
  const [isExpanded, setIsExpanded] = useState(false);
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    if (!isExpanded) return;

    const extractArray = (value: any): any[] => {
      if (Array.isArray(value)) return value;
      if (Array.isArray(value?.data)) return value.data;
      if (Array.isArray(value?.content)) return value.content;
      if (Array.isArray(value?.data?.content)) return value.data.content;
      return [];
    };

    // Tải rules.
    const loadRules = async () => {
      try {
        const response = await SystemRuleService.getAllNoPaging();
        const ruleList = extractArray(response);

        console.log("Rules raw response:", response);
        console.log("Rules parsed list:", ruleList);

        setRules(ruleList);
      } catch (error) {
        console.error("Lỗi khi tải bộ luật:", error);
        setRules([]);
      }
    };

    loadRules();
  }, [isExpanded]);

  const seasonLabel =
    seasons.length > 0
      ? seasons
          .slice(0, 2)
          .map((season) => season.name || season.year || `#${season.id}`)
          .join(", ")
      : "Chưa có mùa giải";

  const activeSeason = seasons.find(
    (season) => getSeasonStatus(season) === "Đang diễn ra",
  );

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#E4E2DE] bg-white shadow-[0_8px_24px_rgba(0,73,14,0.05)] transition hover:border-[#BFCABA]">
      <div className="flex flex-col gap-y-4 px-6 py-5 md:grid md:grid-cols-12 md:items-center">
        <div className="flex items-center gap-4 md:col-span-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] bg-[#F5F3EF] ring-1 ring-[#E4E2DE]">
            {league.logo ? (
              <img
                src={league.logo}
                alt={league.name || "Logo"}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <span className="material-symbols-outlined text-3xl text-[#0D631B]">
                emoji_events
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-base font-black text-[#1B1C1A]">
              {league.name}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#707A6C]">
              <span>ID: {league.id}</span>
              <span className="h-1 w-1 rounded-full bg-[#BFCABA]" />
              <span>{league.scale || "Chưa cập nhật"}</span>
            </div>
          </div>
        </div>

        <div className="text-sm font-bold text-[#40493D] md:col-span-2">
          {league.country || "Chưa cập nhật"}
        </div>

        <div className="text-sm font-bold text-[#40493D] md:col-span-2">
          <p className="line-clamp-2">{seasonLabel}</p>
          {seasons.length > 2 && (
            <p className="mt-1 text-[11px] font-black text-[#707A6C]">
              +{seasons.length - 2} mùa giải khác
            </p>
          )}
          {activeSeason && (
            <p className="mt-1 text-[11px] font-black text-[#0D631B]">
              Hiện tại: {activeSeason.year || activeSeason.name}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <StatusPill status={league.status} />
        </div>

        <div className="flex gap-2 md:col-span-2 md:justify-end">
          <IconButton
            icon="expand_more"
            title="Quản lý mùa giải"
            active={isExpanded}
            onClick={() => setIsExpanded((current) => !current)}
          />
          <IconButton icon="edit" title="Sửa giải đấu" onClick={onEdit} />
          <IconButton
            icon="delete"
            title="Xóa giải đấu"
            danger
            onClick={onDelete}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#E4E2DE] bg-[#F5F3EF] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h5 className="flex items-center gap-2 text-sm font-black text-[#1B1C1A]">
                <span className="material-symbols-outlined text-[#0D631B]">
                  stadium
                </span>
                Mùa giải của {league.name}
              </h5>
              <p className="mt-1 text-xs font-medium text-[#707A6C]">
                Season nằm trong ngữ cảnh League và dùng để quản lý vòng đấu,
                đăng ký đội, lịch thi đấu.
              </p>
            </div>

            {league.id && (
              <button
                type="button"
                onClick={() => onAddSeason(league.id!)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D631B] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#00490E]"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Thêm mùa giải
              </button>
            )}
          </div>

          {seasons.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#BFCABA] bg-white p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-[#0D631B]">
                event_busy
              </span>
              <p className="mt-3 text-sm font-black text-[#1B1C1A]">
                Chưa có mùa giải nào
              </p>
              <p className="mt-1 text-xs font-medium text-[#707A6C]">
                Tạo mùa giải đầu tiên để bắt đầu gán bộ luật và đăng ký đội.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {seasons.map((season) => {
                const safeRules = Array.isArray(rules) ? rules : [];

                const systemRuleId =
                  season.systemRuleId ?? season.ruleId ?? season.systemRule?.id;

                const matchedRule = safeRules.find(
                  (rule) => Number(rule.id) === Number(systemRuleId),
                );

                const ruleName =
                  matchedRule?.ruleName?.trim() ||
                  season.systemRuleName?.trim?.() ||
                  season.systemRule?.ruleName?.trim?.() ||
                  (systemRuleId
                    ? `Bộ luật #${systemRuleId}`
                    : "Chưa gán bộ luật");

                const status = getSeasonStatus(season);

                return (
                  <div
                    key={season.id}
                    className="rounded-[1.5rem] border border-[#E4E2DE] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-[#1B1C1A]">
                          {season.name || "Mùa giải chưa đặt tên"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#707A6C]">
                          {season.year || "Chưa cập nhật năm"}
                        </p>
                      </div>
                      <SeasonStatusPill status={status} />
                    </div>

                    <div className="space-y-2 rounded-[1rem] bg-[#F5F3EF] p-4 text-xs font-bold text-[#40493D]">
                      <InfoLine
                        icon="calendar_month"
                        label="Thời gian"
                        value={`${formatDate(season.startDate)} - ${formatDate(
                          season.endDate,
                        )}`}
                      />
                      <InfoLine icon="gavel" label="Bộ luật" value={ruleName} />
                      <InfoLine
                        icon="tag"
                        label="Mã mùa giải"
                        value={`#${season.id ?? "N/A"}`}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#E4E2DE] pt-4">
                      <button
                        type="button"
                        onClick={() => onEditSeason(season)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F0EEEA] px-3 py-2 text-xs font-black text-[#40493D] transition hover:bg-[#E4E2DE]"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSeason(season.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  desc: string;
  icon: string;
  accent: "green" | "lime" | "amber";
}> = ({ title, value, desc, icon, accent }) => {
  const accentClass =
    accent === "lime"
      ? "bg-[#B2F746]/30 text-[#496F00]"
      : accent === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-[#0D631B]/10 text-[#0D631B]";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E4E2DE] bg-white p-6 shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F5F3EF]" />
      <div
        className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-full ${accentClass}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
        {title}
      </p>
      <p className="mt-2 text-4xl font-black text-[#1B1C1A]">{value}</p>
      <p className="mt-2 text-xs font-medium text-[#707A6C]">{desc}</p>
    </div>
  );
};

type FilterOption = string | { label: string; value: string };

// Hiển thị FilterSelect.
function FilterSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FilterOption[];
}) {
  return (
    <label className="block lg:col-span-2">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-full border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
      >
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { label: option, value: option }
              : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

// Hiển thị StatusPill.
function StatusPill({ status }: { status?: string | null }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
        active
          ? "bg-[#B2F746]/30 text-[#0D631B]"
          : "bg-[#F0EEEA] text-[#707A6C]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#0D631B]" : "bg-[#707A6C]"
        }`}
      />
      {getStatusLabel(status)}
    </span>
  );
}

// Hiển thị SeasonStatusPill.
function SeasonStatusPill({ status }: { status: string }) {
  const className =
    status === "Đang diễn ra"
      ? "bg-[#B2F746]/30 text-[#0D631B]"
      : status === "Sắp diễn ra"
        ? "bg-amber-100 text-amber-700"
        : "bg-[#F0EEEA] text-[#707A6C]";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${className}`}
    >
      {status}
    </span>
  );
}

// Hiển thị IconButton.
function IconButton({
  icon,
  title,
  active,
  danger,
  onClick,
}: {
  icon: string;
  title: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-full p-2 transition ${
        active
          ? "rotate-180 bg-[#F0EEEA] text-[#1B1C1A]"
          : danger
            ? "text-[#707A6C] hover:bg-red-50 hover:text-red-600"
            : "text-[#707A6C] hover:bg-[#F0EEEA] hover:text-[#1B1C1A]"
      }`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
  );
}

// Hiển thị InfoLine.
function InfoLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-start gap-2">
      <span className="material-symbols-outlined mt-0.5 text-sm text-[#0D631B]">
        {icon}
      </span>
      <span className="text-[#707A6C]">{label}:</span>
      <span className="font-black text-[#1B1C1A]">{value}</span>
    </p>
  );
}

// Hiển thị EmptyState.
const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="rounded-[2rem] border border-dashed border-[#BFCABA] bg-white px-6 py-14 text-center shadow-sm">
    <span className="material-symbols-outlined text-6xl text-[#0D631B]">
      search_off
    </span>
    <h3 className="mt-4 text-xl font-black text-[#1B1C1A]">
      Không có giải đấu phù hợp
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#707A6C]">
      Thử thay đổi bộ lọc hoặc tạo mới một giải đấu để bắt đầu quản lý mùa giải.
    </p>
    <button
      type="button"
      onClick={onCreate}
      className="mt-6 rounded-full bg-[#0D631B] px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#00490E]"
    >
      Tạo giải đấu mới
    </button>
  </div>
);

export default TournamentManagement;
