import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AddMatchModal from "./AddMatchModal";
import ConfirmModal from "../../../components/ConfirmModal";
import GenerateScheduleModal from "../../../components/match/GenerateScheduleModal";
import MatchRefereeAssignmentModal from "../../../components/match/MatchRefereeAssignmentModal";
import { Modal } from "../../../components/Modal";
import StatusBadge from "../../../components/common/StatusBadge";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { AppLayout } from "../../../layouts/AppLayout";
import { PhanTrang } from "../../../utils/PhanTrang";

import { MatchModel } from "../../../model/Match/MatchModel";

import MatchService from "../../../services/MatchService";
import LeagueService from "../../../services/LeagueService";
import RoundService from "../../../services/RoundService";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../services/websocket/NotificationSocketService";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  getMatchStatusLabel,
  getStatusTone,
} from "../../../utils/statusUtils";

const SO_TRAN_MOI_TRANG = 8;
const CLIENT_FETCH_SIZE = 1000;

// Lấy match time.
const getMatchTime = (match: MatchModel) =>
  new Date(match?.matchDate || 0).getTime();

// Xử lý matches by upcoming priority.
const sortMatchesByUpcomingPriority = (items: MatchModel[]) => {
  const now = Date.now();

  return [...items].sort((a, b) => {
    const timeA = getMatchTime(a);
    const timeB = getMatchTime(b);
    const isUpcomingA = timeA >= now;
    const isUpcomingB = timeB >= now;

    if (isUpcomingA !== isUpcomingB) {
      return isUpcomingA ? -1 : 1;
    }

    if (isUpcomingA && isUpcomingB) {
      return timeA - timeB;
    }

    return timeB - timeA;
  });
};

// Xử lý unique matches by id.
const uniqueMatchesById = (items: MatchModel[]) => {
  const map = new Map<number | string, MatchModel>();
  items.forEach((item, index) => {
    map.set(
      item?.id ??
        `${item?.homeTeam?.id}-${item?.awayTeam?.id}-${item?.matchDate}-${index}`,
      item,
    );
  });
  return Array.from(map.values());
};

// Hiển thị MatchSchedule.
export default function MatchSchedule() {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [editingMatch, setEditingMatch] = useState<MatchModel | null>(null);
  const [refereeMatchId, setRefereeMatchId] = useState<number | null>(null);
  const [isGenerateScheduleOpen, setIsGenerateScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [predictingIds, setPredictingIds] = useState<Set<number>>(new Set());
  const [emptyMessage, setEmptyMessage] = useState(
    "Chưa có trận đấu phù hợp với bộ lọc hiện tại.",
  );

  const [leagues, setLeagues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);

  const [selectedLeague, setSelectedLeague] = useState<number | "">("");
  const [selectedSeason, setSelectedSeason] = useState<number | "">("");
  const [selectedRound, setSelectedRound] = useState<number | "">("");

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const [filters, setFilters] = useState({
    status: "Tất cả trạng thái",
    search: "",
  });

  // Xử lý lưu dữ liệu.
  const handleSaveMatch = async (payload: any) => {
    try {
      if (editingMatch) {
        await MatchService.updateMatch(editingMatch.id!, payload);
        toast.success("Đã cập nhật trận đấu.");
      } else {
        await MatchService.addMatch(payload);
        toast.success("Đã thêm trận đấu.");
      }
      setOpen(false);
      setEditingMatch(null);
      fetchMatches(trangHienTai);
    } catch (error) {
      console.error("Lỗi khi lưu trận đấu:", error);
      toast.error(getErrorMessage(error, "Có lỗi xảy ra khi lưu trận đấu!"));
    }
  };

  // Xử lý xóa dữ liệu.
  const handleDeleteMatch = async (id: number) => {
    setDeletingMatchId(id);
  };

  // Xử lý xóa dữ liệu.
  const handleConfirmDeleteMatch = async () => {
    if (!deletingMatchId) return;

    try {
      setDeleteLoading(true);
      await MatchService.deleteMatch(deletingMatchId);
      toast.success("Đã xóa trận đấu.");
      setDeletingMatchId(null);
      fetchMatches(trangHienTai);
    } catch (error) {
      console.error("Lỗi khi xóa trận đấu:", error);
      toast.error(getErrorMessage(error, "Có lỗi xảy ra khi xóa trận đấu!"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xử lý predict match.
  const handlePredictMatch = async (match: MatchModel) => {
    if (!match.id) return;

    setPredictingIds((current) => new Set(current).add(match.id!));

    try {
      const response = await MatchService.predictMatch(match.id);
      const predictedMatch = response.data;

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id
            ? new MatchModel({ ...item, ...predictedMatch })
            : item,
        ),
      );
      fetchMatches(trangHienTai);
    } catch (error) {
      console.error("Lỗi khi dự đoán trận đấu:", error);
      toast.error(getErrorMessage(error, "Không thể dự đoán trận đấu. Vui lòng thử lại!"));
    } finally {
      setPredictingIds((current) => {
        const next = new Set(current);
        next.delete(match.id!);
        return next;
      });
    }
  };

  useEffect(() => {
    // Lấy leagues.
    const fetchLeagues = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 100);
        setLeagues(response.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách giải đấu:", error);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    // Lấy seasons.
    const fetchSeasons = async () => {
      if (!selectedLeague) {
        setSeasons([]);
        setSelectedSeason("");
        return;
      }

      try {
        const response = await LeagueService.getSeasonsByLeague(
          Number(selectedLeague),
        );
        setSeasons(response);
        setSelectedSeason("");
        setSelectedRound("");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mùa giải:", error);
        setSeasons([]);
        setSelectedSeason("");
        setSelectedRound("");
      }
    };
    fetchSeasons();
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedSeason) {
      // Lấy rounds.
      const fetchRounds = async () => {
        try {
          const response = await RoundService.getAllRoundsNormalized(
            0,
            100,
            Number(selectedSeason),
          );
          setRounds(response.content || []);
        } catch (error) {
          console.error("Lỗi lấy dữ liệu vòng đấu:", error);
          setRounds([]);
        }
      };
      fetchRounds();
    } else {
      setRounds([]);
      setSelectedRound("");
    }
  }, [selectedSeason]);

  const fetchMatches = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        if (selectedLeague && !selectedSeason && seasons.length === 0) {
          setMatches([]);
          setTongSoTrang(0);
          setTongSoPhanTu(0);
          setTrangHienTai(1);
          setEmptyMessage(
            "Giải đấu này chưa có mùa giải hoặc chưa có trận đấu nào.",
          );
          return;
        }

        if (selectedLeague && !selectedSeason) {
          const responses = await Promise.all(
            seasons
              .filter((season) => season.id)
              .map((season) =>
                MatchService.getAllMatches(0, CLIENT_FETCH_SIZE, {
                  ...filters,
                  seasonId: season.id,
                }),
              ),
          );

          const allMatches = sortMatchesByUpcomingPriority(
            uniqueMatchesById(
              responses.flatMap((response) => response.data?.content || []),
            ),
          );
          const start = (page - 1) * SO_TRAN_MOI_TRANG;
          const pagedMatches = allMatches.slice(
            start,
            start + SO_TRAN_MOI_TRANG,
          );

          setMatches(pagedMatches);
          setTongSoTrang(
            Math.max(1, Math.ceil(allMatches.length / SO_TRAN_MOI_TRANG)),
          );
          setTongSoPhanTu(allMatches.length);
          setTrangHienTai(page);
          setEmptyMessage("Không có trận đấu nào thuộc giải đấu đã chọn.");
          return;
        }

        const res = await MatchService.getAllMatches(
          page - 1,
          SO_TRAN_MOI_TRANG,
          {
            ...filters,
            seasonId: selectedSeason ? selectedSeason : undefined,
            roundId: selectedRound ? selectedRound : undefined,
          },
        );

        const data = res.data;
        const content = sortMatchesByUpcomingPriority(data.content || []);

        setMatches(content);
        setTongSoTrang(data.totalPages || 0);
        setTongSoPhanTu(data.totalElements || 0);
        setTrangHienTai((data.number ?? page - 1) + 1);
        setEmptyMessage(
          selectedSeason
            ? "Mùa giải/vòng đấu này chưa có trận đấu nào."
            : "Chưa có trận đấu phù hợp với bộ lọc hiện tại.",
        );
      } catch (err) {
        console.error(err);
        setMatches([]);
        setTongSoTrang(0);
        setTongSoPhanTu(0);
        setEmptyMessage("Không thể tải lịch thi đấu.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, selectedLeague, selectedSeason, selectedRound, seasons],
  );

  useEffect(() => {
    fetchMatches(trangHienTai);
  }, [trangHienTai, fetchMatches]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_MATCHES" ||
        event.referenceType === "MATCH"
      ) {
        fetchMatches(trangHienTai);
      }
    },
    [fetchMatches, trangHienTai],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setTrangHienTai(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              <span className="text-green-700">Lịch Thi</span> Đấu
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý và cập nhật lịch thi đấu mới nhất
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:w-auto lg:min-w-[720px]">
            <select
              className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold shadow-sm outline-none hover:bg-gray-50"
              value={selectedLeague}
              onChange={(e) => {
                setTrangHienTai(1);
                setSelectedLeague(e.target.value ? Number(e.target.value) : "");
                setSelectedSeason("");
                setSelectedRound("");
              }}
            >
              <option value="">Tất cả giải đấu</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>

            <select
              className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold shadow-sm outline-none hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedSeason}
              onChange={(e) => {
                setTrangHienTai(1);
                setSelectedSeason(e.target.value ? Number(e.target.value) : "");
                setSelectedRound("");
              }}
              disabled={!selectedLeague || seasons.length === 0}
            >
              <option value="">Tất cả mùa giải</option>
              {seasons.map((season) => (
                <option
                  key={season.id ?? season.name ?? season.year}
                  value={season.id ?? ""}
                >
                  {season.name || season.year}
                </option>
              ))}
            </select>

            <select
              className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold shadow-sm outline-none hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedRound}
              onChange={(e) => {
                setTrangHienTai(1);
                setSelectedRound(e.target.value ? Number(e.target.value) : "");
              }}
              disabled={!selectedSeason}
            >
              <option value="">Tất cả vòng đấu</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.name || `Vòng ${round.roundNumber}`}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="space-y-5 rounded-[2rem] border border-gray-200 bg-[#f0ede6]/40 p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,1fr)_auto] xl:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="h-12 w-full rounded-xl border border-gray-100 bg-white px-4 text-sm font-bold shadow-sm outline-none"
                >
                  <option>Tất cả trạng thái</option>
                  <option value="SCHEDULED">Chưa diễn ra</option>
                  <option value="FINISHED">Đã kết thúc</option>
                  <option value="CONFLICT">Xung đột</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tìm kiếm
                </label>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Tên đội..."
                  className="h-12 w-full rounded-xl border border-gray-100 bg-white px-4 text-sm font-bold shadow-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[360px]">
              {/* <button
                type="button"
                onClick={() => setIsGenerateScheduleOpen(true)}
                disabled={!selectedSeason}
                className="h-12 rounded-xl border border-green-100 bg-white px-5 text-sm font-bold text-green-700 shadow-sm transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sinh lịch tự động
              </button> */}

              <button
                type="button"
                onClick={() => {
                  setEditingMatch(null);
                  setOpen(true);
                }}
                className="h-12 rounded-xl bg-green-700 px-5 text-sm font-bold text-white shadow-md transition-colors hover:bg-green-800"
              >
                + Thêm trận đấu
              </button>
            </div>
          </div>

          <div className="mt-6 min-h-[600px] overflow-x-auto">
            <div className="min-w-[1180px] space-y-3">
              <div className="grid grid-cols-[150px_320px_190px_150px_150px_170px] border-t border-gray-200/60 px-6 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div>Thời gian</div>
                <div className="text-center">Trận đấu</div>
                <div>Sân/Giải đấu</div>
                <div className="text-center">Dự đoán</div>
                <div className="text-center">Trạng thái</div>
                <div className="text-right">Thao tác</div>
              </div>

              {isLoading ? (
                <LoadingSpinner
                  message="Đang tải lịch thi đấu"
                  description="Danh sách trận đấu đang được đồng bộ theo giải đấu, mùa giải và vòng đấu bạn đang chọn."
                  fullHeight
                />
              ) : matches.length > 0 ? (
                matches.map((match, index) => (
                  <MatchRow
                    key={match.id ?? index}
                    match={match}
                    onEdit={(m) => {
                      setEditingMatch(m);
                      setOpen(true);
                    }}
                    onDelete={handleDeleteMatch}
                    onPredict={handlePredictMatch}
                    onAssignReferee={(matchId) => setRefereeMatchId(matchId)}
                    isPredicting={
                      match.id ? predictingIds.has(match.id) : false
                    }
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center font-bold text-gray-500">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm">
              Hiển thị{" "}
              <b>
                {tongSoPhanTu === 0
                  ? "0"
                  : `${(trangHienTai - 1) * SO_TRAN_MOI_TRANG + 1} - ${Math.min(
                      trangHienTai * SO_TRAN_MOI_TRANG,
                      tongSoPhanTu,
                    )}`}
              </b>{" "}
              trong {tongSoPhanTu} trận
            </p>

            {tongSoPhanTu > 0 && (
              <PhanTrang
                tongSoTrang={tongSoTrang}
                trangHienTai={trangHienTai}
                xuLyTrang={(p) => setTrangHienTai(p)}
              />
            )}
          </div>
        </div>

        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditingMatch(null);
          }}
        >
          {open && (
            <AddMatchModal
              onClose={() => {
                setOpen(false);
                setEditingMatch(null);
              }}
              initialData={editingMatch}
              onSave={handleSaveMatch}
            />
          )}
        </Modal>
        <MatchRefereeAssignmentModal
          open={refereeMatchId !== null}
          matchId={refereeMatchId}
          onClose={() => setRefereeMatchId(null)}
          onChanged={() => fetchMatches(trangHienTai)}
        />
        <GenerateScheduleModal
          open={isGenerateScheduleOpen}
          seasonId={selectedSeason ? Number(selectedSeason) : null}
          onClose={() => setIsGenerateScheduleOpen(false)}
          onGenerated={() => fetchMatches(1)}
        />
        <ConfirmModal
          open={deletingMatchId !== null}
          title="Xóa trận đấu"
          message="Bạn có chắc chắn muốn xóa trận đấu này? Hành động này không dễ hoàn tác."
          confirmText="Xóa trận"
          cancelText="Hủy"
          danger
          loading={deleteLoading}
          onConfirm={handleConfirmDeleteMatch}
          onClose={() => {
            if (!deleteLoading) setDeletingMatchId(null);
          }}
        />
      </div>
    </AppLayout>
  );
}

// Xử lý has predicted score.
function hasPredictedScore(match: MatchModel) {
  return match.predictedHomeScore != null && match.predictedAwayScore != null;
}

// Hiển thị MatchRow.
function MatchRow({
  match,
  onEdit,
  onDelete,
  onPredict,
  onAssignReferee,
  isPredicting,
}: {
  match: MatchModel;
  onEdit: (m: MatchModel) => void;
  onDelete: (id: number) => void;
  onPredict: (m: MatchModel) => void;
  onAssignReferee: (id: number) => void;
  isPredicting: boolean;
}) {
  const navigate = useNavigate();
  const date = new Date(match.matchDate);

  const isConflict = String(match.status) === "CONFLICT";
  const hasPrediction = hasPredictedScore(match);

  // Hiển thị status.
  const renderStatus = (status: string) => {
    if (status === "CONFLICT") {
      return <StatusBadge label="Xung đột" tone="danger" />;
    }

    return (
      <StatusBadge
        label={getMatchStatusLabel(status)}
        tone={getStatusTone(status)}
      />
    );
  };

  return (
    <div
      onClick={() => navigate(`/matches/${match.id}`)}
      className={`grid cursor-pointer grid-cols-[150px_320px_190px_150px_150px_170px] items-center rounded-xl p-6 transition-all ${
        isConflict
          ? "border-2 border-red-200 bg-red-50"
          : "bg-white shadow-sm hover:shadow-md"
      }`}
    >
      <div>
        <p className={`text-sm font-bold ${isConflict ? "text-red-500" : ""}`}>
          {date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-gray-400">
          {date.toLocaleDateString("vi-VN")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5">
        <div className="flex w-28 flex-col items-center gap-1">
          <img
            src={match.homeTeam?.logo || "/default.png"}
            className="h-10 w-10 object-contain"
          />
          <span className="line-clamp-2 text-center text-xs font-bold">
            {match.homeTeam?.name}
          </span>
        </div>

        <div className="text-lg font-black italic text-gray-300">VS</div>

        <div className="flex w-28 flex-col items-center gap-1">
          <img
            src={match.awayTeam?.logo || "/default.png"}
            className="h-10 w-10 object-contain"
          />
          <span className="line-clamp-2 text-center text-xs font-bold">
            {match.awayTeam?.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-400">
          location_on
        </span>
        <span
          className={`line-clamp-2 text-sm ${isConflict ? "font-bold text-red-500" : ""}`}
        >
          {match.league?.name || "-"}
        </span>
      </div>

      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        {hasPrediction ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">
            <span className="material-symbols-outlined text-sm">
              psychology
            </span>
            {match.predictedHomeScore} - {match.predictedAwayScore}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onPredict(match)}
            disabled={isPredicting || !match.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-sm">
              {isPredicting ? "hourglass_top" : "analytics"}
            </span>
            {isPredicting ? "Đang dự đoán" : "Dự đoán"}
          </button>
        )}
      </div>

      <div className="flex justify-center">
        {renderStatus(String(match.status))}
      </div>

      <div
        className="flex justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(match)}
          className="rounded-full p-2 hover:bg-gray-100"
          title="Sửa trận đấu"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>

        <button
          onClick={() => match.id && onAssignReferee(match.id)}
          className="rounded-full p-2 text-green-700 hover:bg-green-50"
          title="Phân công trọng tài"
        >
          <span className="material-symbols-outlined text-sm">sports</span>
        </button>

        <button
          onClick={() => match.id && onDelete(match.id)}
          className="rounded-full p-2 text-red-500 hover:bg-red-100"
          title="Xóa trận đấu"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}
