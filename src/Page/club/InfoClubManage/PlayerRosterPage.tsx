import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../../../layouts/AppLayout";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { PhanTrang } from "../../../utils/PhanTrang";
import { Modal } from "../../../components/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import PlayerService from "../../../services/PlayerService";
import TeamService from "../../../services/TeamService";
import { Player } from "../../../model/Player";
import {
  calculateAge,
  fallbackAvatar,
  initials,
  positionLabel,
  statusLabel,
  useCurrentClubId,
} from "./clubInfoHelpers";

interface RosterPlayer {
  id: number;
  squadNo: string;
  name: string;
  secondaryInfo: string;
  position: string;
  rawPosition: string;
  age: string;
  nationality: string;
  image?: string | null;
  status: string;
  source: Player;
}

type PlayerFormErrors = Record<string, string>;

const PAGE_SIZE = 10;

const createEmptyPlayer = (teamId: number | null) =>
  new Player({
    name: "",
    idCode: null,
    dateOfBirth: "",
    position: "GK",
    detailPosition: null,
    shirtNumber: 0,
    nationality: "Việt Nam",
    height: 170,
    weight: 65,
    status: "ACTIVE",
    avatar: null,
    teamId,
    teamName: null,
  });

const PlayerRosterPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [teamName, setTeamName] = useState("Đang tải...");
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RosterPlayer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPlayers = async () => {
    if (authLoading) return;

    if (!currentClubId) {
      setLoading(false);
      setError("Không xác định được câu lạc bộ của người dùng đang đăng nhập.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [data, team] = await Promise.all([
        PlayerService.getPlayersByTeamNormalized(
          currentClubId,
          currentPage - 1,
          PAGE_SIZE,
        ),
        TeamService.getTeamById(currentClubId),
      ]);

      setTeamName(team?.name || "Câu lạc bộ");
      setPlayers(
        (data.content ?? [])
          .map(normalizeRosterPlayer)
          .filter((player: RosterPlayer | null): player is RosterPlayer =>
            Boolean(player),
          ),
      );
      setTotalPages(Number(data.totalPages ?? 1));
      setTotalElements(Number(data.totalElements ?? data.content?.length ?? 0));
    } catch (err) {
      console.error("Cannot load players by team", err);
      setError("Không thể tải danh sách cầu thủ của câu lạc bộ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, currentClubId, currentPage]);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !normalizedSearch ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        player.squadNo.includes(normalizedSearch) ||
        player.nationality.toLowerCase().includes(normalizedSearch);
      const matchesPosition =
        !positionFilter || player.rawPosition === positionFilter;

      return matchesSearch && matchesPosition;
    });
  }, [players, positionFilter, search]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const openEditModal = (player: RosterPlayer) => {
    setEditingPlayer(new Player(player.source));
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await PlayerService.deletePlayer(deleteTarget.id);
      toast.success("Đã xóa cầu thủ khỏi danh sách biên chế.");
      setDeleteTarget(null);
      if (players.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await loadPlayers();
      }
    } catch (err) {
      console.error("Cannot delete player", err);
      toast.error(
        "Không thể xóa cầu thủ. Vui lòng kiểm tra ràng buộc dữ liệu.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const exportPlayers = () => {
    if (filteredPlayers.length === 0) {
      toast.warning("Không có cầu thủ để xuất danh sách.");
      return;
    }

    downloadCsv(
      `danh-sach-cau-thu-${teamName}.csv`,
      ["STT", "Số áo", "Họ tên", "Vị trí", "Tuổi", "Quốc tịch", "Trạng thái"],
      filteredPlayers.map((player, index) => [
        index + 1,
        player.squadNo,
        player.name,
        player.position,
        player.age,
        player.nationality,
        player.status,
      ]),
    );
    toast.success("Đã xuất danh sách cầu thủ.");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 font-['Be_Vietnam_Pro']">
        <RosterHeader
          total={totalElements}
          teamName={teamName}
          onCreate={openCreateModal}
          onExport={exportPlayers}
        />

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

        <PlayerTable
          players={filteredPlayers}
          loading={loading}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />

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

      <ClubPlayerModal
        open={modalOpen}
        currentClubId={currentClubId ?? null}
        currentPlayer={editingPlayer}
        onClose={() => setModalOpen(false)}
        onSuccess={async () => {
          await loadPlayers();
          setModalOpen(false);
        }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Xóa cầu thủ"
        message={`Bạn có chắc chắn muốn xóa ${deleteTarget?.name ?? "cầu thủ này"} khỏi danh sách biên chế?`}
        confirmText="Xóa"
        cancelText="Hủy"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
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
    secondaryInfo: player.idCode
      ? `Mã định danh: ${player.idCode}`
      : "Chưa có mã định danh",
    position: positionLabel(player.position || player.detailPosition),
    rawPosition: player.position || "",
    age: calculateAge(player.dateOfBirth),
    nationality: player.nationality || "Việt Nam",
    image: player.avatar,
    status: statusLabel(player.status),
    source: player,
  };
}

function RosterHeader({
  total,
  teamName,
  onCreate,
  onExport,
}: {
  total: number;
  teamName: string;
  onCreate: () => void;
  onExport: () => void;
}) {
  return (
    <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-950">
          Danh sách cầu thủ
        </h1>
        <p className="mt-1 font-medium text-[#008C2F]">
          {total} cầu thủ thuộc {teamName}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExport}
          className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-[#008C2F]/20 bg-white px-6 py-2.5 text-sm font-semibold text-[#008C2F] transition hover:bg-green-50"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Xuất danh sách
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(27,28,26,0.12)] transition hover:bg-[#0d631b]"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Thêm cầu thủ
        </button>
      </div>
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
          placeholder="Tìm theo tên, số áo hoặc quốc tịch..."
          className="w-full rounded-sm border-none bg-[#eae8e4] py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:ring-1 focus:ring-[#008C2F]/30"
        />
      </div>

      <select
        value={positionFilter}
        onChange={(event) => onPositionChange(event.target.value)}
        className="min-w-[180px] cursor-pointer appearance-none rounded-sm border-none bg-[#eae8e4] px-4 py-2.5 pr-8 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-[#008C2F]/30"
      >
        <option value="">Tất cả vị trí</option>
        <option value="GK">Thủ môn</option>
        <option value="DF">Hậu vệ</option>
        <option value="MF">Tiền vệ</option>
        <option value="FW">Tiền đạo</option>
      </select>
    </section>
  );
}

function PlayerTable({
  players,
  loading,
  onEdit,
  onDelete,
}: {
  players: RosterPlayer[];
  loading: boolean;
  onEdit: (player: RosterPlayer) => void;
  onDelete: (player: RosterPlayer) => void;
}) {
  if (loading) {
    return (
      <LoadingSpinner
        message="Đang tải danh sách cầu thủ"
        description="Danh sách cầu thủ của câu lạc bộ đang được tải theo trang hiện tại."
        fullHeight
      />
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
        <div className="w-32 text-right">Thao tác</div>
      </div>

      {players.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-gray-500">
          Không tìm thấy cầu thủ phù hợp.
        </div>
      ) : (
        players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onEdit={() => onEdit(player)}
            onDelete={() => onDelete(player)}
          />
        ))
      )}
    </section>
  );
}

function PlayerRow({
  player,
  onEdit,
  onDelete,
}: {
  player: RosterPlayer;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        <div className="flex justify-start gap-2 md:w-32 md:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-gray-200 p-2 text-gray-600 hover:bg-white hover:text-[#008C2F]"
            title="Cập nhật"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-red-100 p-2 text-red-500 hover:bg-red-50"
            title="Xóa"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function ClubPlayerModal({
  open,
  currentClubId,
  currentPlayer,
  onClose,
  onSuccess,
}: {
  open: boolean;
  currentClubId: number | null;
  currentPlayer?: Player | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const [player, setPlayer] = useState<Player>(
    createEmptyPlayer(currentClubId),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PlayerFormErrors>({});
  const isEditMode = Boolean(currentPlayer?.id);

  useEffect(() => {
    if (!open) return;
    setPlayer(
      currentPlayer
        ? new Player({ ...currentPlayer, teamId: currentClubId })
        : createEmptyPlayer(currentClubId),
    );
    setErrors({});
  }, [currentClubId, currentPlayer, open]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

    setPlayer((prev) => {
      const next = new Player(prev);
      if (["shirtNumber", "height", "weight"].includes(name)) {
        (next as unknown as Record<string, unknown>)[name] = Number(value);
        return next;
      }
      (next as unknown as Record<string, unknown>)[name] = value || null;
      return next;
    });
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn file hình ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ảnh không nên vượt quá 2MB để tránh dữ liệu lưu quá lớn.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPlayer(
        (prev) => new Player({ ...prev, avatar: String(reader.result || "") }),
      );
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors: PlayerFormErrors = {};
    if (!currentClubId) nextErrors.teamId = "Không xác định được CLB hiện tại.";
    if (!player.name.trim()) nextErrors.name = "Vui lòng nhập tên cầu thủ.";
    if (!player.dateOfBirth)
      nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    if (!player.position) nextErrors.position = "Vui lòng chọn vị trí.";
    if (player.shirtNumber < 0) nextErrors.shirtNumber = "Số áo không hợp lệ.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = new Player({ ...player, teamId: currentClubId });
      if (payload.id) {
        await PlayerService.updatePlayer(payload.id, payload);
        toast.success("Cập nhật cầu thủ thành công.");
      } else {
        await PlayerService.addPlayer(payload);
        toast.success("Thêm cầu thủ vào biên chế thành công.");
      }
      await onSuccess();
    } catch (error) {
      console.error("Cannot save player", error);
      toast.error("Không thể lưu thông tin cầu thủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl" contentClassName="p-0">
      <form className="bg-[#fbf9f5]" onSubmit={handleSubmit}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-[#fbf9f5] px-8 py-5">
          <div>
            <h2 className="text-xl font-black text-gray-950">
              {isEditMode ? "Cập nhật cầu thủ" : "Thêm cầu thủ mới"}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Cầu thủ sẽ được gắn với câu lạc bộ đang đăng nhập.
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full bg-[#f5f3ef]">
                <img
                  src={player.avatar || fallbackAvatar}
                  alt={player.name || "player"}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-sm font-bold text-gray-700">
                Ảnh đại diện cầu thủ
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Có thể nhập URL ảnh hoặc chọn file ảnh từ máy.
              </p>
              <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100">
                <span className="material-symbols-outlined mr-1 text-[16px]">
                  upload
                </span>
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {errors.teamId && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
                {errors.teamId}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-black text-gray-950">
                Thông tin cơ bản
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Họ tên"
                  name="name"
                  value={player.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <InputField
                  label="CCCD / Mã định danh"
                  name="idCode"
                  value={player.idCode ?? ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={player.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                />
                <InputField
                  label="Quốc tịch"
                  name="nationality"
                  value={player.nationality}
                  onChange={handleChange}
                />
                <SelectField
                  label="Vị trí"
                  name="position"
                  value={player.position}
                  onChange={handleChange}
                  error={errors.position}
                  options={[
                    { value: "GK", label: "Thủ môn" },
                    { value: "DF", label: "Hậu vệ" },
                    { value: "MF", label: "Tiền vệ" },
                    { value: "FW", label: "Tiền đạo" },
                  ]}
                />
                <InputField
                  label="Vị trí chi tiết"
                  name="detailPosition"
                  value={player.detailPosition ?? ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: Trung vệ, tiền đạo cắm..."
                />
                <InputField
                  label="Số áo"
                  name="shirtNumber"
                  type="number"
                  value={player.shirtNumber}
                  onChange={handleChange}
                  error={errors.shirtNumber}
                />
                <SelectField
                  label="Trạng thái"
                  name="status"
                  value={player.status}
                  onChange={handleChange}
                  options={[
                    { value: "ACTIVE", label: "Đang hoạt động" },
                    { value: "INJURED", label: "Chấn thương" },
                    { value: "SUSPENDED", label: "Bị treo giò" },
                    { value: "INACTIVE", label: "Tạm ngưng" },
                  ]}
                />
                <InputField
                  label="Chiều cao (cm)"
                  name="height"
                  type="number"
                  value={player.height}
                  onChange={handleChange}
                />
                <InputField
                  label="Cân nặng (kg)"
                  name="weight"
                  type="number"
                  value={player.weight}
                  onChange={handleChange}
                />
                <InputField
                  label="Avatar URL"
                  name="avatar"
                  value={player.avatar ?? ""}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-6 py-3 text-sm font-bold text-gray-500 hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#008C2F] px-8 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Cập nhật"
                    : "Thêm cầu thủ"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${positionClass[position] ?? "bg-gray-100 text-gray-600"}`}
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

type InputFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="px-1 text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#008C2F]/20"
      />
      {error && <p className="px-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="px-1 text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#008C2F]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="px-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function downloadCsv(
  filename: string,
  headers: Array<string | number>,
  rows: Array<Array<string | number>>,
) {
  const escapeCell = (value: string | number) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.replace(/[\\/:*?"<>|]+/g, "-");
  link.click();
  URL.revokeObjectURL(url);
}
