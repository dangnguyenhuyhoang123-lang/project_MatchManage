import React, { useEffect, useMemo, useState } from "react";
import CreateTournament from "./CreateTournament";

import { Modal } from "../../../../components/Modal";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import { AppLayout } from "../../../../layouts/AppLayout";
import LeagueService from "../../../../services/LeagueService";
import { PhanTrang } from "../../../../utils/PhanTrang";
import { League } from "../../../../model/LeagueModel";
type FilterState = {
  search: string;
  scale: string;
  status: string;
};

type LeagueWithSeasons = {
  league: League;
  seasons: Array<{
    id?: number;
    year?: string;
    name?: string;
  }>;
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

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-stone-100 text-stone-500",
};

const normalizeKeyword = (value: string) => value.trim().toLowerCase();
const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;

const StatCard: React.FC<{
  title: string;
  value: string;
  trend: string;
  desc: string;
  icon: string;
  colorClass?: string;
}> = ({ title, value, trend, desc, icon, colorClass = "text-primary" }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-stone-100 p-6">
    <div className="absolute right-0 top-0 p-8 opacity-5 transition-transform group-hover:scale-110">
      <span className="material-symbols-outlined text-8xl">{icon}</span>
    </div>
    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">
      {title}
    </h3>
    <div className="flex items-end gap-2">
      <span className="font-headline text-4xl font-bold leading-none">
        {value}
      </span>
      <span
        className={`${colorClass} mb-1 flex items-center text-sm font-bold`}
      >
        <span className="material-symbols-outlined text-xs">trending_up</span>
        {trend}
      </span>
    </div>
    <p className="mt-4 text-xs text-stone-400">{desc}</p>
  </div>
);

const TournamentManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [items, setItems] = useState<LeagueWithSeasons[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const hasClientFilters = useMemo(
    () =>
      appliedFilters.scale !== "Tất cả quy mô" ||
      appliedFilters.status !== "Tất cả trạng thái",
    [appliedFilters],
  );

  const filterClientItems = (
    leagues: LeagueWithSeasons[],
    filters: FilterState,
  ) => {
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
  };

  const fetchLeagueSeasons = async (leagueId?: number) => {
    if (!leagueId) return [];

    try {
      return await LeagueService.getSeasonsByLeague(leagueId);
    } catch (error) {
      console.error(`Lỗi khi tải mùa giải cho league ${leagueId}:`, error);
      return [];
    }
  };

  const enrichLeagues = async (leagues: League[]) => {
    const seasonsList = await Promise.all(
      leagues.map((league) => fetchLeagueSeasons(league.id)),
    );

    return leagues.map((league, index) => ({
      league,
      seasons: seasonsList[index].map((season) => ({
        id: season.id,
        year: season.year,
        name: season.name,
      })),
    }));
  };

  const fetchLeagues = async (page = 1, filters = appliedFilters) => {
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
  };

  useEffect(() => {
    fetchLeagues(trangHienTai, appliedFilters);
  }, [trangHienTai, appliedFilters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setTrangHienTai(1);
    setAppliedFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setTrangHienTai(1);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleDelete = async (league: League) => {
    if (!league.id) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa giải đấu ${league.name}?`)) {
      try {
        await LeagueService.deleteLeague(league.id);
        fetchLeagues(trangHienTai, appliedFilters);
      } catch (error) {
        console.error("Lỗi khi xóa giải đấu:", error);
        alert("Không thể xóa giải đấu này.");
      }
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

  return (
    <AppLayout>
      <header className="mb-10 flex justify-between items-end">
        <h2 className="mb-2 font-['Be_Vietnam_Pro'] text-4xl font-black tracking-tight text-gray-900">
          Quản lý giải đấu
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input
              name="search"
              value={draftFilters.search}
              onChange={handleFilterChange}
              className="w-64 rounded-full border-none bg-stone-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-700/20"
              placeholder="Tìm kiếm giải đấu..."
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              search
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedLeague(null);
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-[#0d631b] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-green-900/20"
          >
            Tạo Giải Đấu
          </button>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 items-end md:grid-cols-12">
        <div className="flex flex-wrap gap-4 md:col-span-8">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Quy mô
            </label>
            <select
              name="scale"
              value={draftFilters.scale}
              onChange={handleFilterChange}
              className="block w-full rounded-xl border-none bg-stone-100 px-4 py-2.5 text-sm"
            >
              <option>Tất cả quy mô</option>
              <option value="Quốc gia">Quốc gia</option>
              <option value="Khu vực">Khu vực</option>
              <option value="Quốc tế">Quốc tế</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Trạng thái
            </label>
            <select
              name="status"
              value={draftFilters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-xl border-none bg-stone-100 px-4 py-2.5 text-sm"
            >
              <option>Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-4 flex justify-end gap-3">
          <button
            onClick={resetFilters}
            className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-600"
          >
            Đặt lại
          </button>
          <button
            onClick={applyFilters}
            className="rounded-xl bg-[#4c56af] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="hidden grid-cols-12 px-6 py-2 text-xs font-bold uppercase tracking-widest text-stone-400 md:grid">
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
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Đang hoạt động"
          value={String(activeCount)}
          trend="+API"
          desc="Số giải đấu đang mở theo bộ lọc hiện tại"
          icon="military_tech"
        />
        <StatCard
          title="Tổng mùa giải"
          value={String(seasonCount)}
          trend="+sync"
          desc="Tổng mùa giải lấy từ endpoint getLeagueSeasons"
          icon="stadium"
          colorClass="text-blue-600"
        />
        <div className="relative overflow-hidden rounded-2xl bg-[#0d631b] p-6 text-white">
          <h3 className="mb-2 text-xs font-bold uppercase text-white/70">
            Hệ thống gợi ý
          </h3>
          <p className="mb-4 text-sm">
            {hasClientFilters
              ? "Bạn đang dùng bộ lọc phía client cho quy mô hoặc trạng thái."
              : "Bạn có thể mở từng giải đấu để đồng bộ thêm dữ liệu mùa giải."}
          </p>
          <button
            onClick={() => {
              setSelectedLeague(null);
              setOpen(true);
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0d631b]"
          >
            Tạo mới
          </button>
        </div>
      </section>

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
          trong số <span className="font-bold">{tongSoPhanTu}</span> giải đấu
        </p>
        <PhanTrang
          tongSoTrang={tongSoTrang}
          trangHienTai={trangHienTai}
          xuLyTrang={(page) => setTrangHienTai(Number(page))}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <CreateTournament
          onClose={() => setOpen(false)}
          currentLeague={selectedLeague}
          onSuccess={() => fetchLeagues(trangHienTai, appliedFilters)}
        />
      </Modal>
    </AppLayout>
  );
};

const TournamentRow: React.FC<{
  item: LeagueWithSeasons;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onEdit, onDelete }) => {
  const { league, seasons } = item;
  const seasonLabel =
    seasons.length > 0
      ? seasons
          .slice(0, 2)
          .map((season) => season.name || season.year || `#${season.id}`)
          .join(", ")
      : "Chưa có mùa giải";

  return (
    <div className="group grid grid-cols-12 items-center rounded-2xl border border-stone-100/50 bg-white px-6 py-4 shadow-sm transition-all hover:bg-stone-50">
      <div className="col-span-12 flex items-center gap-4 md:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-green-50">
          {league.logo ? (
            <img
              src={league.logo}
              alt="Logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-green-700">
              emoji_events
            </span>
          )}
        </div>
        <div>
          <h4 className="font-headline font-bold text-stone-900">
            {league.name}
          </h4>
          <p className="text-xs text-stone-400">ID: {league.id}</p>
          <p className="text-xs text-stone-400">{league.scale}</p>
        </div>
      </div>
      <div className="col-span-6 mt-4 text-sm font-medium text-stone-600 md:col-span-2 md:mt-0">
        {league.country}
      </div>
      <div className="col-span-6 mt-4 text-sm font-medium text-stone-600 md:col-span-2 md:mt-0">
        {seasonLabel}
      </div>
      <div className="col-span-6 mt-4 md:col-span-2 md:mt-0">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            STATUS_STYLES[league.status] ?? "bg-stone-100 text-stone-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              league.status === "ACTIVE" ? "bg-green-600" : "bg-stone-400"
            }`}
          ></span>
          {getStatusLabel(league.status)}
        </span>
      </div>
      <div className="col-span-6 mt-4 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 md:col-span-2 md:mt-0">
        <button
          onClick={onEdit}
          className="rounded-full p-2 text-stone-400 transition-all hover:bg-green-50 hover:text-green-700"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="rounded-full p-2 text-stone-400 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
    Không có giải đấu phù hợp với bộ lọc hiện tại.
  </div>
);

export default TournamentManagement;
