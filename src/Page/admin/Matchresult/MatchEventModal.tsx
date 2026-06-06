import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/Modal";

import type {
  EventType,
  GoalType,
  MatchEvent,
  MatchEventUpsertRequest,
} from "../../../model/Match/MatchEvents";

import type {
  MatchLineup,
  MatchLineupsResponse,
} from "../../../model/Match/MatchLineup";

type MatchEventModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MatchEventUpsertRequest) => Promise<void>;

  loading?: boolean;

  homeTeamId: number;
  homeTeamName: string;

  awayTeamId: number;
  awayTeamName: string;

  lineups?: MatchLineupsResponse | null;
  events?: MatchEvent[];
  eventPlayersByTeam?: Record<number, MatchLineup[]>;
  allowedGoalTypes?: GoalType[];
  maxGoalMinute?: number | null;
};

type EventFormState = {
  eventType: EventType;
  goalType: GoalType;
  teamId: number;
  playerId: number;
  playerInId: number;
  assistPlayerId: number;
  minute: number;
  extraMinute: number | null;
  note: string;
};

type EventFormErrors = Partial<Record<keyof EventFormState, string>>;

const initialForm: EventFormState = {
  eventType: "GOAL",
  goalType: "NORMAL",
  teamId: 0,
  playerId: 0,
  playerInId: 0,
  assistPlayerId: 0,
  minute: 1,
  extraMinute: null,
  note: "",
};

export default function MatchEventModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  homeTeamId,
  homeTeamName,
  awayTeamId,
  awayTeamName,
  lineups,
  events = [],
  allowedGoalTypes,
  maxGoalMinute,
}: MatchEventModalProps) {
  const [eventForm, setEventForm] = useState<EventFormState>(initialForm);
  const [errors, setErrors] = useState<EventFormErrors>({});

  useEffect(() => {
    if (open) {
      setEventForm(initialForm);
      setErrors({});
    }
  }, [open]);

  const selectedTeamLineups: MatchLineup[] = useMemo(() => {
    if (!eventForm.teamId || !lineups) return [];

    if (eventForm.teamId === lineups.home?.teamId) {
      return lineups.home.lineups ?? [];
    }

    if (eventForm.teamId === lineups.away?.teamId) {
      return lineups.away.lineups ?? [];
    }

    return [];
  }, [eventForm.teamId, lineups]);

  const currentPlayerState = useMemo(() => {
    const playerById = new Map<number, MatchLineup>();
    const playingIds = new Set<number>();
    const benchIds = new Set<number>();

    selectedTeamLineups.forEach((player) => {
      const playerId = Number(player.playerId);
      if (!Number.isFinite(playerId) || playerId <= 0) return;

      playerById.set(playerId, player);

      if (player.isStarting) {
        playingIds.add(playerId);
      } else {
        benchIds.add(playerId);
      }
    });

    const substitutionEvents = events
      .filter((event) => {
        const playerOutId = Number(event.playerId);
        const playerInId = Number(event.playerInId);

        return (
          event.eventType === "SUBSTITUTION" &&
          Number(event.teamId) === Number(eventForm.teamId) &&
          Number.isFinite(playerOutId) &&
          Number.isFinite(playerInId) &&
          playerOutId > 0 &&
          playerInId > 0
        );
      })
      .sort((a, b) => {
        const minuteDiff = Number(a.minute ?? 0) - Number(b.minute ?? 0);
        if (minuteDiff !== 0) return minuteDiff;

        const extraDiff =
          Number(a.extraMinute ?? 0) - Number(b.extraMinute ?? 0);
        if (extraDiff !== 0) return extraDiff;

        return Number(a.eventOrder ?? a.id ?? 0) - Number(b.eventOrder ?? b.id ?? 0);
      });

    substitutionEvents.forEach((event) => {
      const playerOutId = Number(event.playerId);
      const playerInId = Number(event.playerInId);

      if (playingIds.has(playerOutId) && benchIds.has(playerInId)) {
        playingIds.delete(playerOutId);
        benchIds.add(playerOutId);

        benchIds.delete(playerInId);
        playingIds.add(playerInId);
      }
    });

    const byLineupOrder = (a: MatchLineup, b: MatchLineup) => {
      const orderA = a.lineupOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.lineupOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999);
    };

    return {
      playingPlayers: Array.from(playingIds)
        .map((playerId) => playerById.get(playerId))
        .filter((player): player is MatchLineup => Boolean(player))
        .sort(byLineupOrder),
      benchPlayers: Array.from(benchIds)
        .map((playerId) => playerById.get(playerId))
        .filter((player): player is MatchLineup => Boolean(player))
        .sort(byLineupOrder),
    };
  }, [eventForm.teamId, events, selectedTeamLineups]);

  const { playingPlayers, benchPlayers } = currentPlayerState;

  const hasSelectedTeam = Boolean(eventForm.teamId);
  const hasLineupForSelectedTeam = selectedTeamLineups.length > 0;
  const mainPlayerOptions = playingPlayers;
  const playerInOptions = benchPlayers;

  const handleChangeEventType = (eventType: EventType) => {
    setErrors({});
    setEventForm((prev) => ({
      ...prev,
      eventType,
      goalType: "NORMAL",
      playerId: 0,
      playerInId: 0,
      assistPlayerId: 0,
      note: "",
    }));
  };

  const handleChangeTeam = (teamId: number) => {
    setErrors((current) => ({
      ...current,
      teamId: undefined,
      playerId: undefined,
      playerInId: undefined,
      assistPlayerId: undefined,
    }));
    setEventForm((prev) => ({
      ...prev,
      teamId,
      playerId: 0,
      playerInId: 0,
      assistPlayerId: 0,
    }));
  };

  const clearError = (field: keyof EventFormState) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: EventFormErrors = {};

    if (!eventForm.teamId) {
      nextErrors.teamId = "Vui lòng chọn đội.";
    }

    if (!eventForm.playerId) {
      nextErrors.playerId =
        eventForm.eventType === "SUBSTITUTION"
          ? "Vui lòng chọn cầu thủ rời sân."
          : "Vui lòng chọn cầu thủ.";
    }

    if (eventForm.eventType === "SUBSTITUTION" && !eventForm.playerInId) {
      nextErrors.playerInId = "Vui lòng chọn cầu thủ vào sân.";
    }

    if (
      eventForm.eventType === "SUBSTITUTION" &&
      eventForm.playerId === eventForm.playerInId
    ) {
      nextErrors.playerInId =
        "Cầu thủ vào sân không được trùng với cầu thủ rời sân.";
    }

    if (eventForm.minute < 0 || eventForm.minute > 130) {
      nextErrors.minute = "Phút thi đấu không hợp lệ.";
    }

    if (eventForm.extraMinute != null && eventForm.extraMinute < 0) {
      nextErrors.extraMinute = "Phút bù giờ không hợp lệ.";
    }

    if (
      eventForm.eventType === "GOAL" &&
      maxGoalMinute != null &&
      eventForm.minute > maxGoalMinute
    ) {
      nextErrors.minute = `Phút ghi bàn không được vượt quá ${maxGoalMinute}.`;
    }

    if (
      eventForm.eventType === "GOAL" &&
      allowedGoalTypes &&
      allowedGoalTypes.length > 0 &&
      !allowedGoalTypes.includes(eventForm.goalType)
    ) {
      nextErrors.goalType = "Loại bàn thắng không nằm trong quy định mùa giải.";
    }

    if (
      eventForm.eventType === "GOAL" &&
      eventForm.assistPlayerId &&
      eventForm.assistPlayerId === eventForm.playerId
    ) {
      nextErrors.assistPlayerId =
        "Cầu thủ kiến tạo không được trùng với cầu thủ ghi bàn.";
    }

    if (eventForm.teamId && !hasLineupForSelectedTeam) {
      nextErrors.teamId = "Doi nay chua co doi hinh thi dau.";
    }

    if (
      eventForm.playerId &&
      !playingPlayers.some((player) => player.playerId === eventForm.playerId)
    ) {
      nextErrors.playerId =
        eventForm.eventType === "SUBSTITUTION"
          ? "Cau thu roi san phai dang thi dau."
          : "Cau thu phai dang thi dau.";
    }

    if (
      eventForm.eventType === "SUBSTITUTION" &&
      eventForm.playerInId &&
      !benchPlayers.some((player) => player.playerId === eventForm.playerInId)
    ) {
      nextErrors.playerInId = "Cau thu vao san phai dang o danh sach du bi.";
    }

    if (
      eventForm.eventType === "GOAL" &&
      eventForm.assistPlayerId &&
      !playingPlayers.some(
        (player) => player.playerId === eventForm.assistPlayerId,
      )
    ) {
      nextErrors.assistPlayerId = "Cau thu kien tao phai dang thi dau.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: MatchEventUpsertRequest = {
      minute: eventForm.minute,
      extraMinute: eventForm.extraMinute,
      eventOrder: null,

      eventType: eventForm.eventType,
      goalType: eventForm.eventType === "GOAL" ? eventForm.goalType : null,

      teamId: eventForm.teamId,

      playerId: eventForm.playerId,
      playerInId:
        eventForm.eventType === "SUBSTITUTION" ? eventForm.playerInId : null,
      assistPlayerId:
        eventForm.eventType === "GOAL" && eventForm.assistPlayerId
          ? eventForm.assistPlayerId
          : null,

      note: eventForm.note.trim() || null,
    };

    await onSubmit(payload);
  };

  const renderPlayerLabel = (player: MatchLineup) => {
    const shirtNumber = player.shirtNumber ? `${player.shirtNumber} - ` : "";
    const position = player.position ? ` (${player.position})` : "";

    return `${shirtNumber}${player.playerName}${position}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!loading}
      contentClassName="p-0"
    >
      <div className="p-6">
        <div className="mb-6 pr-10">
          <h3 className="text-xl font-black text-gray-900">
            Thêm sự kiện trận đấu
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Nếu là bàn thắng, hệ thống sẽ tự cập nhật lại tỉ số sau khi lưu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Loại sự kiện
            </label>
            <select
              value={eventForm.eventType}
              onChange={(e) =>
                handleChangeEventType(e.target.value as EventType)
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
            >
              <option value="GOAL">Bàn thắng</option>
              <option value="YELLOW_CARD">Thẻ vàng</option>
              <option value="RED_CARD">Thẻ đỏ</option>
              <option value="SUBSTITUTION">Thay người</option>
            </select>
          </div>

          {/* Goal type */}
          {eventForm.eventType === "GOAL" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Loại bàn thắng
              </label>
              <select
                value={eventForm.goalType}
                onChange={(e) => {
                  setEventForm((prev) => ({
                    ...prev,
                    goalType: e.target.value as GoalType,
                  }));
                  clearError("goalType");
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="NORMAL">Bàn thắng thường</option>
                <option value="PENALTY">Penalty</option>
                <option value="OWN_GOAL">Phản lưới nhà</option>
              </select>
              {errors.goalType && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.goalType}
                </p>
              )}
            </div>
          )}

          {/* Team */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Đội
            </label>
            <select
              value={eventForm.teamId}
              onChange={(e) => handleChangeTeam(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
            >
              <option value={0}>Chọn đội</option>
              <option value={homeTeamId}>{homeTeamName}</option>
              <option value={awayTeamId}>{awayTeamName}</option>
            </select>
            {errors.teamId && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.teamId}
              </p>
            )}
          </div>

          {/* Main player */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              {eventForm.eventType === "SUBSTITUTION"
                ? "Cầu thủ rời sân"
                : eventForm.eventType === "GOAL"
                  ? "Cầu thủ ghi bàn"
                  : "Cầu thủ"}
            </label>

            <select
              value={eventForm.playerId}
              onChange={(e) => {
                setEventForm((prev) => ({
                  ...prev,
                  playerId: Number(e.target.value),
                }));
                clearError("playerId");
                clearError("assistPlayerId");
              }}
              disabled={!hasSelectedTeam || mainPlayerOptions.length === 0}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
            >
              <option value={0}>
                {eventForm.teamId ? "Chọn cầu thủ" : "Vui lòng chọn đội trước"}
              </option>

              {mainPlayerOptions.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {renderPlayerLabel(player)}
                </option>
              ))}
            </select>
            {hasSelectedTeam && !hasLineupForSelectedTeam && (
              <p className="mt-1 text-xs font-bold text-amber-600">
                Doi nay chua co doi hinh thi dau.
              </p>
            )}
            {hasLineupForSelectedTeam && mainPlayerOptions.length === 0 && (
              <p className="mt-1 text-xs font-bold text-amber-600">
                Khong co cau thu dang thi dau phu hop.
              </p>
            )}
            {errors.playerId && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.playerId}
              </p>
            )}
          </div>

          {/* Player in */}
          {eventForm.eventType === "SUBSTITUTION" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Cầu thủ vào sân
              </label>

              <select
                value={eventForm.playerInId}
                onChange={(e) => {
                  setEventForm((prev) => ({
                    ...prev,
                    playerInId: Number(e.target.value),
                  }));
                  clearError("playerInId");
                }}
                disabled={!hasSelectedTeam || playerInOptions.length === 0}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
              >
                <option value={0}>
                  {eventForm.teamId
                    ? "Chọn cầu thủ vào sân"
                    : "Vui lòng chọn đội trước"}
                </option>

                {playerInOptions.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {renderPlayerLabel(player)}
                  </option>
                ))}
              </select>
              {hasLineupForSelectedTeam && playerInOptions.length === 0 && (
                <p className="mt-1 text-xs font-bold text-amber-600">
                  Khong con cau thu du bi de thay vao san.
                </p>
              )}
              {errors.playerInId && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.playerInId}
                </p>
              )}
            </div>
          )}

          {/* Assist player */}
          {eventForm.eventType === "GOAL" &&
            eventForm.goalType !== "OWN_GOAL" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Cầu thủ kiến tạo
                </label>

                <select
                  value={eventForm.assistPlayerId}
                  onChange={(e) => {
                    setEventForm((prev) => ({
                      ...prev,
                      assistPlayerId: Number(e.target.value),
                    }));
                    clearError("assistPlayerId");
                  }}
                  disabled={!hasSelectedTeam || mainPlayerOptions.length === 0}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
                >
                  <option value={0}>Không có / bỏ trống</option>

                  {mainPlayerOptions
                    .filter((p) => p.playerId !== eventForm.playerId)
                    .map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {renderPlayerLabel(player)}
                      </option>
                    ))}
                </select>
                {errors.assistPlayerId && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {errors.assistPlayerId}
                  </p>
                )}
              </div>
            )}

          {/* Minute */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Phút
            </label>
            <input
              type="number"
              min={0}
              max={130}
              value={eventForm.minute}
              onChange={(e) => {
                setEventForm((prev) => ({
                  ...prev,
                  minute: Number(e.target.value),
                }));
                clearError("minute");
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
            />
            {errors.minute && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.minute}
              </p>
            )}
          </div>

          {/* Extra minute */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Phút bù giờ
            </label>
            <input
              type="number"
              min={0}
              value={eventForm.extraMinute ?? ""}
              onChange={(e) => {
                setEventForm((prev) => ({
                  ...prev,
                  extraMinute:
                    e.target.value === "" ? null : Number(e.target.value),
                }));
                clearError("extraMinute");
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
              placeholder="VD: 2"
            />
            {errors.extraMinute && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.extraMinute}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Ghi chú
            </label>
            <input
              value={eventForm.note}
              onChange={(e) =>
                setEventForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
              placeholder="Ghi chú nếu có"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-60"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-green-800 text-white font-bold hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu sự kiện"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
