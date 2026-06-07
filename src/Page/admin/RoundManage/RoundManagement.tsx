import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../../components/ConfirmModal";
import { Modal } from "../../../components/Modal";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import CreateRoundModal from "./CreateRoundModal";
import { AppLayout } from "../../../layouts/AppLayout";
import { SeasonModel } from "../../../model/SeasonModel";
import { RoundModel } from "../../../model/RoundModel";
import RoundService from "../../../services/RoundService";
import SeasonService from "../../../services/SeasonService";
import { PhanTrang } from "../../../utils/PhanTrang";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";
import { getErrorMessage } from "../../../utils/errorUtils";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
};

const STATUS_CLASSES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-[#0d631b]",
  COMPLETED: "bg-zinc-100 text-zinc-500",
};

// Định dạng date time.
const formatDateTime = (value: string) => {
  if (!value) return { date: "Chưa có ngày", time: "" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: value, time: "" };
  }

  return {
    date: date.toLocaleDateString("vi-VN"),
    time: `${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} GMT+7`,
  };
};

// Lấy status label.
const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;

const RoundManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<RoundModel | null>(null);
  const [rounds, setRounds] = useState<RoundModel[]>([]);
  const [seasons, setSeasons] = useState<SeasonModel[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingRound, setDeletingRound] = useState<RoundModel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  useEffect(() => {
    // Lấy seasons.
    const fetchSeasons = async () => {
      try {
        const response = await SeasonService.getAllSeasons(0, 1000);
        const rawSeasons = Array.isArray(response.data)
          ? response.data
          : (response.data?.content ?? []);

        setSeasons(
          rawSeasons.map(
            (season: any) =>
              new SeasonModel({
                id: season.id,
                year: season.year ?? "",
                name: season.name ?? "",
                leagueName: season.leagueName ?? season.league?.name ?? null,
              }),
          ),
        );
      } catch (error) {
        console.error("Lỗi khi tải mùa giải:", error);
        setSeasons([]);
      }
    };

    fetchSeasons();
  }, []);

  const fetchRounds = useCallback(async (page = 1, seasonId?: number) => {
    setIsLoading(true);

    try {
      const data = await RoundService.getAllRoundsNormalized(
        page - 1,
        PAGE_SIZE,
        seasonId,
      );

      setRounds(data.content ?? []);
      setTongSoTrang(data.totalPages ?? 0);
      setTongSoPhanTu(data.totalElements ?? 0);
      setTrangHienTai((data.number ?? page - 1) + 1);
    } catch (error) {
      console.error("Lỗi khi tải vòng đấu:", error);
      setRounds([]);
      setTongSoTrang(0);
      setTongSoPhanTu(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRounds(
      trangHienTai,
      selectedSeasonId ? Number(selectedSeasonId) : undefined,
    );
  }, [fetchRounds, trangHienTai, selectedSeasonId]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_ROUNDS" ||
        event.action === "REFETCH_SEASONS"
      ) {
        void fetchRounds(
          trangHienTai,
          selectedSeasonId ? Number(selectedSeasonId) : undefined,
        );
      }
    },
    [fetchRounds, selectedSeasonId, trangHienTai],
  );

  useRealtimeEvent(handleRealtimeEvent);

  // Xử lý xóa dữ liệu.
  const handleDelete = async (round: RoundModel) => {
    if (!round.id) return;
    setDeletingRound(round);
  };

  // Xử lý xóa dữ liệu.
  const handleConfirmDelete = async () => {
    if (!deletingRound?.id) return;

    try {
      setDeleteLoading(true);
      await RoundService.deleteRound(deletingRound.id);
      toast.success("Đã xóa vòng đấu.");
      setDeletingRound(null);
      fetchRounds(
        trangHienTai,
        selectedSeasonId ? Number(selectedSeasonId) : undefined,
      );
    } catch (error) {
      console.error("Lỗi khi xóa vòng đấu:", error);
      toast.error(getErrorMessage(error, "Không thể xóa vòng đấu này."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const quickStats = useMemo(
    () => ({
      total: tongSoPhanTu,
      scheduled: rounds.filter((round) => round.status === "SCHEDULED").length,
      ongoing: rounds.filter((round) => round.status === "ONGOING").length,
    }),
    [rounds, tongSoPhanTu],
  );

  return (
    <AppLayout>
      <header className="mb-10 flex justify-between items-end">
        <h2 className="mb-2 font-['Be_Vietnam_Pro'] text-4xl font-black tracking-tight text-gray-900">
          Quản lý Vòng đấu
        </h2>

        <button
          onClick={() => {
            setSelectedRound(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#0d631b] px-5 py-3 font-semibold text-white transition hover:scale-[1.02]"
        >
          + Tạo vòng đấu
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-4 md:flex-row md:p-6 lg:col-span-8">
          <select
            value={selectedSeasonId}
            onChange={(e) => {
              setTrangHienTai(1);
              setSelectedSeasonId(e.target.value);
            }}
            className="flex-1 rounded-lg p-3 shadow-sm"
          >
            <option value="">Tất cả mùa giải</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.displayName}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setTrangHienTai(1);
              setSelectedSeasonId("");
            }}
            className="rounded-lg bg-white px-4 py-3 text-sm font-semibold shadow-sm"
          >
            Đặt lại
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-[#4c56af] p-6 text-white lg:col-span-4">
          <div>
            <p className="text-xs opacity-80">Thống kê nhanh</p>
            <h3 className="text-2xl font-bold">{quickStats.total} Vòng đấu</h3>
          </div>
          <p className="text-xs opacity-60">Cập nhật hôm nay</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="hidden grid-cols-12 px-6 py-2 text-xs font-bold text-zinc-400 lg:grid">
          <div className="col-span-4">Thông tin</div>
          <div className="col-span-2">Mùa giải</div>
          <div className="col-span-2 text-center">Thời gian</div>
          <div className="col-span-2 text-center">Trạng thái</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {isLoading ? (
          <LoadingSpinner
            message="Đang tải danh sách vòng đấu"
            description="Hệ thống đang đồng bộ vòng đấu theo mùa giải bạn đang chọn."
            fullHeight
          />
        ) : rounds.length > 0 ? (
          rounds.map((round) => {
            const start = formatDateTime(round.startDate);
            return (
              <div
                key={round.id}
                className="grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm lg:grid-cols-12 lg:gap-0"
              >
                <div className="flex items-center gap-3 lg:col-span-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded font-bold ${
                      STATUS_CLASSES[round.status] ??
                      "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {round.roundNumber}
                  </div>
                  <div>
                    <p className="font-semibold">{round.name}</p>
                    <p className="text-xs text-gray-400">
                      Tối đa {round.maxMatches} trận
                    </p>
                  </div>
                </div>

                <div className="text-sm lg:col-span-2">
                  {round.seasonName || "Chưa có mùa giải"}
                </div>

                <div className="text-sm text-center lg:col-span-2">
                  <p>{start.date}</p>
                  <p className="text-xs text-gray-400">{start.time}</p>
                </div>

                <div className="flex justify-center lg:col-span-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      STATUS_CLASSES[round.status] ??
                      "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {getStatusLabel(round.status)}
                  </span>
                </div>

                <div className="flex justify-end gap-2 lg:col-span-2">
                  <button
                    onClick={() => {
                      setSelectedRound(round);
                      setOpen(true);
                    }}
                    className="rounded p-2 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined text-base">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(round)}
                    className="rounded p-2 hover:bg-red-100"
                  >
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
            Không có vòng đấu phù hợp.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-gray-100 p-6 lg:col-span-2">
          <h4 className="mb-2 font-bold">Tối ưu lịch</h4>
          <p className="text-sm text-gray-600">
            Đang đồng bộ số trận tối đa, thời gian bắt đầu/kết thúc và mùa giải
            cho từng vòng đấu.
          </p>
        </div>

        <div className="rounded-xl bg-green-700 p-6 text-white">
          <h4 className="font-bold">Theo dõi trạng thái</h4>
          <p className="mt-2 text-sm text-green-50">
            {quickStats.ongoing} vòng đang diễn ra, {quickStats.scheduled} vòng
            đã lên lịch.
          </p>
        </div>
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
          trong số <span className="font-bold">{tongSoPhanTu}</span> vòng đấu
        </p>
        <PhanTrang
          tongSoTrang={tongSoTrang}
          trangHienTai={trangHienTai}
          xuLyTrang={(page) => setTrangHienTai(Number(page))}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} size="xl">
        <CreateRoundModal
          onClose={() => setOpen(false)}
          currentRound={selectedRound}
          onSuccess={() =>
            fetchRounds(
              trangHienTai,
              selectedSeasonId ? Number(selectedSeasonId) : undefined,
            )
          }
        />
      </Modal>
      <ConfirmModal
        open={deletingRound !== null}
        title="Xóa vòng đấu"
        message={`Bạn có chắc chắn muốn xóa ${deletingRound?.name ?? "vòng đấu này"}?`}
        confirmText="Xóa vòng đấu"
        cancelText="Hủy"
        danger
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleteLoading) setDeletingRound(null);
        }}
      />
    </AppLayout>
  );
};

export default RoundManagement;
