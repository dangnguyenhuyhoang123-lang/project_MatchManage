import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import MatchRefereeService, {
  type MatchRefereeResponse,
} from "../../services/MatchRefereeService";
import { extractApiErrorMessage } from "../../utils/apiError";

type RefereeRole =
  | "MAIN_REFEREE"
  | "ASSISTANT_REFEREE"
  | "FOURTH_OFFICIAL"
  | "VAR";

type MatchRefereeAssignmentModalProps = {
  open: boolean;
  matchId: number | null;
  onClose: () => void;
  onChanged?: () => void;
};

const roleOptions: Array<{ value: RefereeRole; label: string }> = [
  { value: "MAIN_REFEREE", label: "Trọng tài chính" },
  { value: "ASSISTANT_REFEREE", label: "Trợ lý trọng tài" },
  { value: "FOURTH_OFFICIAL", label: "Trọng tài thứ tư" },
  { value: "VAR", label: "VAR" },
];

export default function MatchRefereeAssignmentModal({
  open,
  matchId,
  onClose,
  onChanged,
}: MatchRefereeAssignmentModalProps) {
  const [assignments, setAssignments] = useState<MatchRefereeResponse[]>([]);
  const [refereeId, setRefereeId] = useState("");
  const [role, setRole] = useState<RefereeRole>("MAIN_REFEREE");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAssignments = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await MatchRefereeService.getByMatch(matchId);
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Cannot load match referees", error);
      setErrorMessage(extractApiErrorMessage(error));
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAssignments();
    }
  }, [open, matchId]);

  const handleAssign = async () => {
    if (!matchId) return;

    const normalizedRefereeId = Number(refereeId);
    if (!Number.isFinite(normalizedRefereeId) || normalizedRefereeId <= 0) {
      setErrorMessage("Vui lòng nhập refereeId hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      await MatchRefereeService.assign({
        matchId,
        refereeId: normalizedRefereeId,
        role,
      });
      setRefereeId("");
      await loadAssignments();
      onChanged?.();
    } catch (error) {
      console.error("Cannot assign referee", error);
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phân công trọng tài này?")) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      await MatchRefereeService.remove(id);
      await loadAssignments();
      onChanged?.();
    } catch (error) {
      console.error("Cannot remove referee assignment", error);
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-[#f5f3ef] p-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">
              Referee ID
            </span>
            <input
              type="number"
              min={1}
              value={refereeId}
              onChange={(event) => setRefereeId(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">
              Vai trò
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as RefereeRole)}
              className="w-full rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleAssign}
            disabled={submitting || !matchId}
            className="self-end rounded-xl bg-[#008C2F] px-5 py-3 text-sm font-black text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            Thêm phân công
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm font-bold text-gray-500">
            Đang tải danh sách trọng tài...
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-8 text-center text-sm font-bold text-gray-500">
            Chưa có trọng tài được phân công cho trận này.
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Trọng tài
                  </p>
                  <p className="mt-1 font-black text-gray-900">
                    {item.refereeName || `Referee #${item.refereeId}`}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {item.refereeNationality || "--"}
                </div>
                <div className="text-sm font-black text-green-700">
                  {roleOptions.find((option) => option.value === item.role)
                    ?.label || item.role}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={submitting}
                  className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
