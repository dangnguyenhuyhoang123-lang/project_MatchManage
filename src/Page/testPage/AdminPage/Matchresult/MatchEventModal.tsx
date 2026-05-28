import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/Modal";

import type {
  EventType,
  GoalType,
  MatchEventUpsertRequest,
} from "../../../../model/Match/MatchEvents";

import type {
  MatchLineup,
  MatchLineupsResponse,
} from "../../../../model/Match/MatchLineup";

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
}: MatchEventModalProps) {
  const [eventForm, setEventForm] = useState<EventFormState>(initialForm);

  useEffect(() => {
    if (open) {
      setEventForm(initialForm);
    }
  }, [open]);

  const selectedPlayers: MatchLineup[] = useMemo(() => {
    if (!eventForm.teamId || !lineups) return [];

    if (eventForm.teamId === lineups.home?.teamId) {
      return lineups.home.lineups ?? [];
    }

    if (eventForm.teamId === lineups.away?.teamId) {
      return lineups.away.lineups ?? [];
    }

    return [];
  }, [eventForm.teamId, lineups]);

  const handleChangeEventType = (eventType: EventType) => {
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
    setEventForm((prev) => ({
      ...prev,
      teamId,
      playerId: 0,
      playerInId: 0,
      assistPlayerId: 0,
    }));
  };

  const validateForm = () => {
    if (!eventForm.teamId) {
      alert("Vui lòng chọn đội.");
      return false;
    }

    if (!eventForm.playerId) {
      alert(
        eventForm.eventType === "SUBSTITUTION"
          ? "Vui lòng chọn cầu thủ rời sân."
          : "Vui lòng chọn cầu thủ.",
      );
      return false;
    }

    if (eventForm.eventType === "SUBSTITUTION" && !eventForm.playerInId) {
      alert("Vui lòng chọn cầu thủ vào sân.");
      return false;
    }

    if (
      eventForm.eventType === "SUBSTITUTION" &&
      eventForm.playerId === eventForm.playerInId
    ) {
      alert("Cầu thủ vào sân không được trùng với cầu thủ rời sân.");
      return false;
    }

    if (eventForm.minute < 0 || eventForm.minute > 130) {
      alert("Phút thi đấu không hợp lệ.");
      return false;
    }

    if (eventForm.extraMinute != null && eventForm.extraMinute < 0) {
      alert("Phút bù giờ không hợp lệ.");
      return false;
    }

    if (
      eventForm.eventType === "GOAL" &&
      eventForm.assistPlayerId &&
      eventForm.assistPlayerId === eventForm.playerId
    ) {
      alert("Cầu thủ kiến tạo không được trùng với cầu thủ ghi bàn.");
      return false;
    }

    return true;
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
                onChange={(e) =>
                  setEventForm((prev) => ({
                    ...prev,
                    goalType: e.target.value as GoalType,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="NORMAL">Bàn thắng thường</option>
                <option value="PENALTY">Penalty</option>
                <option value="OWN_GOAL">Phản lưới nhà</option>
              </select>
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
              onChange={(e) =>
                setEventForm((prev) => ({
                  ...prev,
                  playerId: Number(e.target.value),
                }))
              }
              disabled={!eventForm.teamId}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
            >
              <option value={0}>
                {eventForm.teamId ? "Chọn cầu thủ" : "Vui lòng chọn đội trước"}
              </option>

              {selectedPlayers.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {renderPlayerLabel(player)}
                </option>
              ))}
            </select>
          </div>

          {/* Player in */}
          {eventForm.eventType === "SUBSTITUTION" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Cầu thủ vào sân
              </label>

              <select
                value={eventForm.playerInId}
                onChange={(e) =>
                  setEventForm((prev) => ({
                    ...prev,
                    playerInId: Number(e.target.value),
                  }))
                }
                disabled={!eventForm.teamId}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
              >
                <option value={0}>
                  {eventForm.teamId
                    ? "Chọn cầu thủ vào sân"
                    : "Vui lòng chọn đội trước"}
                </option>

                {selectedPlayers.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {renderPlayerLabel(player)}
                  </option>
                ))}
              </select>
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
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      assistPlayerId: Number(e.target.value),
                    }))
                  }
                  disabled={!eventForm.teamId}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100"
                >
                  <option value={0}>Không có / bỏ trống</option>

                  {selectedPlayers
                    .filter((p) => p.playerId !== eventForm.playerId)
                    .map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {renderPlayerLabel(player)}
                      </option>
                    ))}
                </select>
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
              onChange={(e) =>
                setEventForm((prev) => ({
                  ...prev,
                  minute: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
            />
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
              onChange={(e) =>
                setEventForm((prev) => ({
                  ...prev,
                  extraMinute:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
              placeholder="VD: 2"
            />
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
