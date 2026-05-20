import React, { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../../../../components/AppLayout";
import { PhanTrang } from "../../../../utils/PhanTrang";
import PlayerService from "../../../../services/PlayerService";
import type { Player } from "../../../../model/Player";
import {
  CURRENT_CLUB_ID,
  calculateAge,
  fallbackAvatar,
  initials,
  positionLabel,
  statusLabel,
} from "./clubInfoHelpers";

interface RosterPlayer {
  id: number;
  squadNo: string;
  name: string;
  secondaryInfo: string;
  position: string;
  age: string;
  nationality: string;
  image?: string | null;
  status: string;
}

const PAGE_SIZE = 10;

const PlayerRosterPage: React.FC = () => {
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await PlayerService.getPlayersByTeamNormalized(
          CURRENT_CLUB_ID,
          currentPage - 1,
          PAGE_SIZE,
        );

        if (!mounted) return;

        setPlayers(
          (data.content ?? [])
            .map(normalizeRosterPlayer)
            .filter(
              (player: RosterPlayer | null): player is RosterPlayer =>
                Boolean(player),
            ),
        );
        setTotalPages(Number(data.totalPages ?? 1));
        setTotalElements(Number(data.totalElements ?? data.content?.length ?? 0));
      } catch (err) {
        console.error("Cannot load players by team", err);
        if (mounted) {
          setError("Không thể tải danh sách cầu thủ của câu lạc bộ.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPlayers();

    return () => {
      mounted = false;
    };
  }, [currentPage]);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !normalizedSearch ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        player.squadNo.includes(normalizedSearch);
      const matchesPosition =
        !positionFilter || player.position === positionFilter;

      return matchesSearch && matchesPosition;
    });
  }, [players, positionFilter, search]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 font-['Be_Vietnam_Pro']">
        <RosterHeader total={totalElements} />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <FilterBar
          search={search}
          positionFilter={positionFilter}
          onSearchChange={setSearch}
          onPositionChange={setPositionFilter}
        />

        <PlayerTable players={filteredPlayers} loading={loading} />

        <PaginationSummary
          shown={filteredPlayers.length}
          total={totalElements}
          currentPage={currentPage}
        />

        <PhanTrang
          tongSoTrang={totalPages}
          trangHienTai={currentPage}
          xuLyTrang={setCurrentPage}
        />
      </div>
    </AppLayout>
  );
};

export default PlayerRosterPage;

function normalizeRosterPlayer(player: Player): RosterPlayer | null {
  if (!player.id) return null;

  return {
    id: player.id,
    squadNo: player.shirtNumber
      ? String(player.shirtNumber).padStart(2, "0")
      : "--",
    name: player.name || "Cầu thủ chưa cập nhật",
    secondaryInfo: player.idCode ? `Mã định danh: ${player.idCode}` : "Chưa có mã định danh",
    position: positionLabel(player.position || player.detailPosition),
    age: calculateAge(player.dateOfBirth),
    nationality: player.nationality || "Việt Nam",
    image: player.avatar,
    status: statusLabel(player.status),
  };
}

function RosterHeader({ total }: { total: number }) {
  return (
    <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-950">
          Danh sách cầu thủ
        </h1>

        <p className="mt-1 font-medium text-[#008C2F]">
          {total} cầu thủ thuộc Becamex TP.Hồ Chí Minh
        </p>
      </div>

      <button
        type="button"
        className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(27,28,26,0.12)] transition hover:bg-[#0d631b]"
      >
        <span className="material-symbols-outlined text-sm transition group-hover:scale-110">
          download
        </span>
        Xuất danh sách
      </button>
    </section>
  );
}

function FilterBar({
  search,
  positionFilter,
  onSearchChange,
  onPositionChange,
}: {
  search: string;
  positionFilter: string;
  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-[2rem] bg-white p-4 shadow-[0_4px_24px_rgba(27,28,26,0.04)]">
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          person_search
        </span>

        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên hoặc số áo..."
          className="w-full rounded-sm border-none bg-[#eae8e4] py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:ring-1 focus:ring-[#008C2F]/30"
        />
      </div>

      <select
        value={positionFilter}
        onChange={(event) => onPositionChange(event.target.value)}
        className="min-w-[180px] cursor-pointer appearance-none rounded-sm border-none bg-[#eae8e4] px-4 py-2.5 pr-8 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-[#008C2F]/30"
      >
        <option value="">Tất cả vị trí</option>
        <option value="Thủ môn">Thủ môn</option>
        <option value="Hậu vệ">Hậu vệ</option>
        <option value="Tiền vệ">Tiền vệ</option>
        <option value="Tiền đạo">Tiền đạo</option>
      </select>
    </section>
  );
}

function PlayerTable({
  players,
  loading,
}: {
  players: RosterPlayer[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-gray-500">
        Đang tải danh sách cầu thủ...
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div className="hidden items-center px-6 py-2 text-xs font-black uppercase tracking-wider text-gray-600 md:flex">
        <div className="w-16">Số áo</div>
        <div className="min-w-[250px] flex-1">Cầu thủ</div>
        <div className="w-32">Vị trí</div>
        <div className="w-24">Tuổi</div>
        <div className="w-40">Quốc tịch</div>
        <div className="w-32 text-right">Trạng thái</div>
      </div>

      {players.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-gray-500">
          Không tìm thấy cầu thủ phù hợp.
        </div>
      ) : (
        players.map((player) => <PlayerRow key={player.id} player={player} />)
      )}
    </section>
  );
}

function PlayerRow({ player }: { player: RosterPlayer }) {
  return (
    <article className="group rounded-[1.5rem] bg-white px-6 py-4 transition hover:bg-[#f5f3ef]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="text-xl font-black text-[#008C2F] md:w-16">
          {player.squadNo}
        </div>

        <div className="flex min-w-[250px] flex-1 items-center gap-4">
          <PlayerAvatar player={player} />

          <div>
            <p className="text-lg font-black text-gray-950">{player.name}</p>
            <p className="text-xs font-medium text-gray-500">
              {player.secondaryInfo}
            </p>
          </div>
        </div>

        <div className="md:w-32">
          <PositionBadge position={player.position} />
        </div>

        <div className="font-medium text-gray-900 md:w-24">{player.age}</div>

        <div className="font-medium text-gray-900 md:w-40">
          {player.nationality}
        </div>

        <div className="flex justify-start md:w-32 md:justify-end">
          <span className="rounded-full bg-[#008C2F]/10 px-3 py-1 text-xs font-black text-[#008C2F]">
            {player.status}
          </span>
        </div>
      </div>
    </article>
  );
}

function PlayerAvatar({ player }: { player: RosterPlayer }) {
  if (player.image) {
    return (
      <img
        src={player.image}
        alt={player.name}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#e4e2de] font-black text-gray-600">
      {initials(player.name) || (
        <img
          src={fallbackAvatar}
          alt={player.name}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function PositionBadge({ position }: { position: string }) {
  const positionClass: Record<string, string> = {
    "Tiền đạo": "bg-indigo-100 text-indigo-700",
    "Tiền vệ": "bg-[#abf4ac] text-[#07521d]",
    "Hậu vệ": "border border-gray-300 bg-[#e4e2de] text-gray-600",
    "Thủ môn": "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        positionClass[position] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {position}
    </span>
  );
}

function PaginationSummary({
  shown,
  total,
  currentPage,
}: {
  shown: number;
  total: number;
  currentPage: number;
}) {
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min((currentPage - 1) * PAGE_SIZE + shown, total);

  return (
    <section className="px-2 pt-2">
      <span className="text-sm text-gray-600">
        Hiển thị {start} đến {end} trong tổng số {total} cầu thủ
      </span>
    </section>
  );
}
