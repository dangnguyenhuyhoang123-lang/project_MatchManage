import React, { useEffect, useMemo, useState } from "react";
import { AddPlayerModal } from "./AddPlayer";
import { Modal } from "../../../components/Modal";
import { AppLayout } from "../../../components/AppLayout";
import { PhanTrang } from "../../../utils/PhanTrang";
import { Player } from "../../../model/Player";
import PlayerService from "../../../services/PlayerService";
import TeamService from "../../../services/TeamService";

type FilterState = {
  position: string;
  club: string;
  status: string;
  search: string;
};

type TeamOption = {
  id: string;
  name: string;
};

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FilterState = {
  position: "Tất cả vị trí",
  club: "Tất cả CLB",
  status: "Tất cả trạng thái",
  search: "",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang thi đấu",
  INJURED: "Chấn thương",
  SUSPENDED: "Bị treo giò",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-[#0d631b]/10 text-[#0d631b]",
  INJURED: "bg-red-100 text-red-600",
  SUSPENDED: "bg-gray-100 text-gray-500",
};

const getPlayerTeamName = (player: Player) => player.teamName || "Chưa gán đội";
const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;
const normalizeKeyword = (value: string) => value.trim().toLowerCase();

const PlayerManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const hasLocalFilters = useMemo(
    () =>
      Boolean(appliedFilters.search.trim()) ||
      appliedFilters.club !== "Tất cả CLB",
    [appliedFilters],
  );

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await TeamService.getAllTeams(0, 1000);
        const rawTeams = Array.isArray(response.data)
          ? response.data
          : response.data?.content ?? [];

        setTeamOptions(
          rawTeams
            .map((team: any) => ({
              id: String(team.id),
              name: team.name,
            }))
            .filter((team: TeamOption) => team.id && team.name),
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách đội:", error);
        setTeamOptions([]);
      }
    };

    fetchTeams();
  }, []);

  const filterPlayersOnClient = (players: Player[], filters: FilterState) => {
    const keyword = normalizeKeyword(filters.search);
    const selectedTeamName = teamOptions.find(
      (team) => team.id === filters.club,
    )?.name;

    return players.filter((player) => {
      const matchesSearch =
        !keyword ||
        normalizeKeyword(player.name).includes(keyword) ||
        normalizeKeyword(String(player.shirtNumber)).includes(keyword) ||
        normalizeKeyword(player.nationality).includes(keyword) ||
        normalizeKeyword(getPlayerTeamName(player)).includes(keyword);

      const matchesTeam =
        filters.club === "Tất cả CLB" ||
        String(player.teamId ?? "") === filters.club ||
        getPlayerTeamName(player) === selectedTeamName;

      return matchesSearch && matchesTeam;
    });
  };

  const fetchPlayers = async (page = 1, filters = appliedFilters) => {
    setIsLoading(true);

    try {
      if (filters.search.trim() || filters.club !== "Tất cả CLB") {
        const baseResponse = await PlayerService.getAllPlayersNormalized(
          0,
          1,
          filters,
        );
        const totalElements = baseResponse.totalElements ?? 0;
        const fetchSize = Math.max(totalElements, 1);
        const fullResponse = await PlayerService.getAllPlayersNormalized(
          0,
          fetchSize,
          filters,
        );

        const clientFilteredPlayers = filterPlayersOnClient(
          fullResponse.content ?? [],
          filters,
        );
        const totalPages = Math.ceil(clientFilteredPlayers.length / PAGE_SIZE);
        const safePage =
          totalPages === 0 ? 1 : Math.min(page, Math.max(totalPages, 1));
        const startIndex = (safePage - 1) * PAGE_SIZE;
        const pagedPlayers = clientFilteredPlayers.slice(
          startIndex,
          startIndex + PAGE_SIZE,
        );

        setDisplayedPlayers(pagedPlayers);
        setTongSoPhanTu(clientFilteredPlayers.length);
        setTongSoTrang(totalPages);
        setTrangHienTai(safePage);
        return;
      }

      const data = await PlayerService.getAllPlayersNormalized(
        page - 1,
        PAGE_SIZE,
        filters,
      );

      setDisplayedPlayers(data.content ?? []);
      setTongSoTrang(data.totalPages ?? 0);
      setTongSoPhanTu(data.totalElements ?? 0);
      setTrangHienTai((data.number ?? page - 1) + 1);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cầu thủ:", error);
      setDisplayedPlayers([]);
      setTongSoTrang(0);
      setTongSoPhanTu(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(trangHienTai, appliedFilters);
  }, [trangHienTai, appliedFilters]);

  const handleUpdate = (player: Player) => {
    setSelectedPlayer(player);
    setOpen(true);
  };

  const handleDelete = async (player: Player) => {
    if (!player.id) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa cầu thủ ${player.name}?`)) {
      try {
        await PlayerService.deletePlayer(player.id);
        fetchPlayers(trangHienTai, appliedFilters);
      } catch (error) {
        console.error("Lỗi khi xóa cầu thủ:", error);
        alert("Không thể xóa cầu thủ này.");
      }
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
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

  return (
    <AppLayout>
      <div className="w-full max-w-[1400px] space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight font-['Be_Vietnam_Pro']">
              Quản lý Cầu thủ
            </h1>
            <p className="font-medium text-[#40493d]">
              Hệ thống quản lý dữ liệu cầu thủ đồng bộ với API và hỗ trợ đầy đủ
              tìm kiếm, bộ lọc, phân trang.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPlayer(null);
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0d631b] to-[#2e7d32] px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined">person_add</span>
            Thêm cầu thủ mới
          </button>
        </div>

        <div className="grid gap-4 rounded-xl bg-[#f5f3ef] p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1.5 xl:col-span-2">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Tìm kiếm
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/40">
                search
              </span>
              <input
                name="search"
                value={draftFilters.search}
                onChange={handleFilterChange}
                placeholder="Tên cầu thủ, số áo, quốc tịch hoặc đội bóng..."
                className="w-full rounded-lg border-none bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0d631b]/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Vị trí
            </label>
            <select
              name="position"
              value={draftFilters.position}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option>Tất cả vị trí</option>
              <option value="GK">Thủ môn (GK)</option>
              <option value="DF">Hậu vệ (DF)</option>
              <option value="MF">Tiền vệ (MF)</option>
              <option value="FW">Tiền đạo (FW)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
              Đội bóng
            </label>
            <select
              name="club"
              value={draftFilters.club}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-none bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="Tất cả CLB">Tất cả CLB</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
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
              <option>Tất cả trạng thái</option>
              <option value="ACTIVE">Đang thi đấu</option>
              <option value="INJURED">Chấn thương</option>
              <option value="SUSPENDED">Bị treo giò</option>
            </select>
          </div>

          <div className="flex items-end gap-3 xl:col-span-5 xl:justify-end">
            <button
              onClick={resetFilters}
              className="h-[42px] rounded-lg border border-[#0d631b]/15 bg-white px-5 font-semibold text-[#0d631b] transition hover:bg-[#0d631b]/5"
            >
              Đặt lại
            </button>
            <button
              onClick={applyFilters}
              className="h-[42px] rounded-lg bg-[#4c56af] px-6 font-semibold text-white hover:opacity-90"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest opacity-40">
            <div className="col-span-4">Cầu thủ</div>
            <div className="col-span-1 text-center">Số áo</div>
            <div className="col-span-2">CLB</div>
            <div className="col-span-2">Quốc tịch</div>
            <div className="col-span-2 text-center">Trạng thái</div>
            <div className="col-span-1 text-right">Thao tác</div>
          </div>

          {isLoading ? (
            Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonRow key={`loading-${index}`} />
            ))
          ) : displayedPlayers.length > 0 ? (
            displayedPlayers.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
              />
            ))
          ) : (
            <EmptyState />
          )}

          <div className="flex items-center justify-between border-t border-black/5 pt-6">
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
              trong số <span className="font-bold">{tongSoPhanTu}</span> cầu thủ
              {hasLocalFilters ? " sau khi lọc" : ""}
            </p>
            <PhanTrang
              tongSoTrang={tongSoTrang}
              trangHienTai={trangHienTai}
              xuLyTrang={(page) => setTrangHienTai(Number(page))}
            />
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AddPlayerModal
          onClose={() => setOpen(false)}
          currentPlayer={selectedPlayer}
          onSuccess={() => fetchPlayers(trangHienTai, appliedFilters)}
        />
      </Modal>
    </AppLayout>
  );
};

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
    Không có cầu thủ phù hợp với bộ lọc hiện tại.
  </div>
);

const SkeletonRow = () => (
  <div className="grid h-[72px] grid-cols-12 items-center rounded-xl bg-white/50 px-6 animate-pulse">
    <div className="col-span-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-gray-200"></div>
      <div className="h-4 w-32 rounded bg-gray-200"></div>
    </div>
    <div className="col-span-1 mx-auto h-4 w-6 rounded bg-gray-200"></div>
    <div className="col-span-2 h-4 w-24 rounded bg-gray-200"></div>
    <div className="col-span-2 h-4 w-20 rounded bg-gray-200"></div>
    <div className="col-span-2 mx-auto h-6 w-16 rounded-full bg-gray-200"></div>
    <div className="col-span-1 flex justify-end gap-2">
      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
    </div>
  </div>
);

const PlayerRow = ({
  player,
  handleUpdate,
  handleDelete,
}: {
  player: Player;
  handleUpdate: (player: Player) => void;
  handleDelete: (player: Player) => void;
}) => {
  const roleBg =
    player.position === "FW"
      ? "bg-[#0d631b]"
      : player.position === "MF"
        ? "bg-[#4c56af]"
        : player.position === "GK"
          ? "bg-amber-600"
          : "bg-stone-600";

  return (
    <div className="group grid h-[72px] grid-cols-12 items-center rounded-xl bg-white px-6 transition-all hover:shadow-xl hover:shadow-stone-200/40">
      <div className="col-span-4 flex items-center gap-4">
        <div className="relative">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={player.avatar || "https://via.placeholder.com/150?text=Player"}
            alt={player.name}
          />
          <span
            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${roleBg}`}
          >
            {player.position}
          </span>
        </div>
        <div>
          <p className="font-bold transition-colors group-hover:text-[#0d631b] font-['Be_Vietnam_Pro']">
            {player.name}
          </p>
          <p className="text-xs opacity-60">
            {player.detailPosition || player.position}
          </p>
        </div>
      </div>

      <div className="col-span-1 text-center text-xl font-black text-[#0d631b]/30 font-['Be_Vietnam_Pro']">
        {player.shirtNumber}
      </div>

      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm opacity-40">
            shield
          </span>
          <span className="text-sm font-semibold">{getPlayerTeamName(player)}</span>
        </div>
      </div>

      <div className="col-span-2 flex items-center gap-2 text-sm opacity-70">
        <span>🇻🇳</span> {player.nationality}
      </div>

      <div className="col-span-2 flex justify-center">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            STATUS_COLORS[player.status] ?? "bg-gray-100 text-gray-500"
          }`}
        >
          {getStatusLabel(player.status)}
        </span>
      </div>

      <div className="col-span-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <ActionBtn
          icon="edit"
          color="text-[#0d631b]"
          onClick={() => handleUpdate(player)}
        />
        <ActionBtn
          icon="delete"
          color="text-red-500"
          onClick={() => handleDelete(player)}
        />
      </div>
    </div>
  );
};

const ActionBtn = ({
  icon,
  color = "text-gray-400",
  onClick,
}: {
  icon: string;
  color?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${color}`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
  </button>
);

export default PlayerManagement;
