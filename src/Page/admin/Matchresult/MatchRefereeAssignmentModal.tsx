import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../../components/ConfirmModal";
import { Modal } from "../../../components/Modal";
import MatchRefereeService, {
  type MatchRefereeResponse,
} from "../../../services/MatchRefereeService";

import RefereeService, { type Referee } from "../../../services/RefereeService";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";

function extractApiErrorMessage(error: unknown) {
  const maybe = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const data = maybe.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return maybe.message || "Không thể xử lý yêu cầu.";
}

type RefereeRole =
  | "MAIN_REFEREE"
  | "ASSISTANT_REFEREE_1"
  | "ASSISTANT_REFEREE_2"
  | "FOURTH_OFFICIAL"
  | "VAR_REFEREE";

type MatchRefereeAssignmentModalProps = {
  open: boolean;
  matchId: number | null;
  onClose: () => void;
  onChanged?: () => void;
};

const roleOptions: Array<{ value: RefereeRole; label: string }> = [
  { value: "MAIN_REFEREE", label: "Trọng tài chính" },
  { value: "ASSISTANT_REFEREE_1", label: "Trợ lý trọng tài 1" },
  { value: "ASSISTANT_REFEREE_2", label: "Trợ lý trọng tài 2" },
  { value: "FOURTH_OFFICIAL", label: "Trọng tài bàn" },
  { value: "VAR_REFEREE", label: "Trọng tài VAR" },
];

export default function MatchRefereeAssignmentModal({
  open,
  matchId,
  onClose,
  onChanged,
}: MatchRefereeAssignmentModalProps) {
  const [assignments, setAssignments] = useState<MatchRefereeResponse[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [refereeId, setRefereeId] = useState("");
  const [role, setRole] = useState<RefereeRole>("MAIN_REFEREE");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingRefereeId, setRemovingRefereeId] = useState<number | null>(
    null,
  );

  const activeReferees = useMemo(
    () =>
      referees.filter((r) => (r.status ?? "ACTIVE").toUpperCase() === "ACTIVE"),
    [referees],
  );

  const loadData = useCallback(async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      setErrorMessage("");
      const [refereeList, assignedRefs] = await Promise.all([
        RefereeService.getAll(),
        MatchRefereeService.getByMatch(matchId),
      ]);
      setReferees(Array.isArray(refereeList.data) ? refereeList.data : []);
      setAssignments(Array.isArray(assignedRefs.data) ? assignedRefs.data : []);
    } catch (error) {
      console.error("Cannot load referees", error);
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (open) loadData();
  }, [loadData, open]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      const referenceId =
        event.referenceId == null ? Number.NaN : Number(event.referenceId);
      const isCurrentMatch =
        !Number.isFinite(referenceId) || referenceId === matchId;

      if (
        open &&
        isCurrentMatch &&
        (event.action === "REFETCH_MATCH_REFEREES" ||
          event.action === "REFETCH_MATCH_DETAIL")
      ) {
        void loadData();
      }
    },
    [loadData, matchId, open],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const handleAssignReferee = async () => {
    if (!matchId) return;
    const normalizedRefereeId = Number(refereeId);
    if (!Number.isFinite(normalizedRefereeId) || normalizedRefereeId <= 0) {
      setErrorMessage("Vui lòng chọn trọng tài.");
      return;
    }
    if (assignments.some((item) => item.refereeId === normalizedRefereeId)) {
      setErrorMessage("Trọng tài này đã được phân công trong trận.");
      return;
    }
    if (assignments.some((item) => item.role === role)) {
      setErrorMessage("Vai trò này đã có người đảm nhiệm.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      await MatchRefereeService.assign({
        matchId,
        refereeId: normalizedRefereeId,
        role,
        note: note.trim() || null,
      });
      toast.success("Đã phân công trọng tài.");
      setRefereeId("");
      setNote("");
      await loadData();
      onChanged?.();
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (value?: string | null) =>
    roleOptions.find((r) => r.value === value)?.label || value || "--";

  return (
    <Modal open={open} onClose={onClose} size="lg" contentClassName="p-0">
      <div className="p-6">
        <div className="mb-6 pr-10">
          <h3 className="text-2xl font-black text-gray-900">
            Phân công trọng tài
          </h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Trận đấu #{matchId ?? "--"}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl bg-[#f5f3ef] p-4">
          <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-500">
            Danh sách trọng tài
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              value={refereeId}
              onChange={(e) => setRefereeId(e.target.value)}
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="">Chọn trọng tài</option>
              {activeReferees.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.level ? `• ${r.level}` : ""}
                </option>
              ))}
            </select>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RefereeRole)}
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              {roleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú phân công"
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none md:col-span-2"
            />
            <button
              type="button"
              onClick={handleAssignReferee}
              disabled={submitting || !matchId}
              className="rounded-xl bg-[#008C2F] px-5 py-3 text-sm font-black text-white disabled:opacity-50 md:col-span-2"
            >
              Thêm trọng tài
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-4 text-center text-sm font-bold text-gray-500">
                Đang tải...
              </p>
            ) : assignments.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-center text-sm font-bold text-gray-500">
                Chưa có trọng tài được phân công.
              </p>
            ) : (
              assignments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3"
                >
                  <div>
                    <p className="font-black text-gray-900">
                      {item.refereeName || `#${item.refereeId}`}
                    </p>
                    <p className="text-xs font-bold text-green-700">
                      {roleLabel(item.role)}
                    </p>
                    {item.note && (
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemovingRefereeId(item.id)}
                    className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <ConfirmModal
          open={removingRefereeId !== null}
          title="Xóa phân công trọng tài"
          message="Bạn có chắc chắn muốn xóa phân công này?"
          confirmText="Xóa"
          cancelText="Hủy"
          danger
          loading={submitting}
          onConfirm={async () => {
            if (!removingRefereeId) return;
            try {
              setSubmitting(true);
              await MatchRefereeService.remove(removingRefereeId);
              setRemovingRefereeId(null);
              await loadData();
              onChanged?.();
            } catch (e) {
              setErrorMessage(extractApiErrorMessage(e));
            } finally {
              setSubmitting(false);
            }
          }}
          onClose={() => setRemovingRefereeId(null)}
        />
      </div>
    </Modal>
  );
}
