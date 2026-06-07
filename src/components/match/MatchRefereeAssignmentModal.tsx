import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmModal from "../ConfirmModal";
import { Modal } from "../Modal";
import MatchRefereeService, {
  type MatchRefereeResponse,
} from "../../services/MatchRefereeService";
import RefereeService, { type Referee } from "../../services/RefereeService";
import { getErrorMessage } from "../../utils/errorUtils";

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
  { value: "FOURTH_OFFICIAL", label: "Trọng tài thứ tư" },
  { value: "VAR_REFEREE", label: "Trọng tài VAR" },
];

const legacyRoleLabels: Record<string, string> = {
  ASSISTANT_REFEREE: "Trợ lý trọng tài",
  VAR: "VAR",
};

// Xử lý role label.
function roleLabel(value?: string | null) {
  return (
    roleOptions.find((option) => option.value === value)?.label ||
    (value ? legacyRoleLabels[value] : "") ||
    value ||
    "--"
  );
}

// Xử lý referee option label.
function refereeOptionLabel(referee: Referee) {
  return [
    referee.name,
    referee.level ? `Cấp ${referee.level}` : "",
    referee.nationality || "",
  ]
    .filter(Boolean)
    .join(" - ");
}

// Hiển thị MatchRefereeAssignmentModal.
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
  const [removingAssignmentId, setRemovingAssignmentId] = useState<number | null>(
    null,
  );

  const activeReferees = useMemo(
    () =>
      referees.filter((referee) =>
        String(referee.status ?? "ACTIVE").toUpperCase() === "ACTIVE",
      ),
    [referees],
  );

  const assignedRefereeIds = useMemo(
    () => new Set(assignments.map((item) => item.refereeId)),
    [assignments],
  );

  const availableReferees = useMemo(
    () =>
      activeReferees.filter((referee) => !assignedRefereeIds.has(referee.id)),
    [activeReferees, assignedRefereeIds],
  );

  const mainRefereeCount = useMemo(
    () => assignments.filter((item) => item.role === "MAIN_REFEREE").length,
    [assignments],
  );

  // Tải data.
  const loadData = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const [refereeList, assignedRefs] = await Promise.all([
        RefereeService.getAll(),
        MatchRefereeService.getByMatch(matchId),
      ]);

      const nextAssignments = Array.isArray(assignedRefs.data)
        ? assignedRefs.data
        : [];

      setReferees(Array.isArray(refereeList.data) ? refereeList.data : []);
      setAssignments(nextAssignments);

      if (nextAssignments.some((item) => item.role === "MAIN_REFEREE")) {
        setRole("ASSISTANT_REFEREE_1");
      } else {
        setRole("MAIN_REFEREE");
      }
    } catch (error) {
      console.error("Cannot load referee assignment data", error);
      setErrorMessage(getErrorMessage(error, "Không thể tải phân công trọng tài."));
      setReferees([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setRefereeId("");
    setNote("");
    setErrorMessage("");
    loadData();
  }, [open, matchId]);

  useEffect(() => {
    if (mainRefereeCount > 0 && role === "MAIN_REFEREE") {
      setRole("ASSISTANT_REFEREE_1");
    }
  }, [mainRefereeCount, role]);

  // Xử lý assign.
  const handleAssign = async () => {
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

    if (role === "MAIN_REFEREE" && mainRefereeCount >= 1) {
      setErrorMessage("Một trận đấu chỉ được có 1 trọng tài chính.");
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
      console.error("Cannot assign referee", error);
      setErrorMessage(getErrorMessage(error, "Không thể phân công trọng tài."));
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xác nhận thao tác.
  const handleConfirmRemove = async () => {
    if (!removingAssignmentId) return;

    try {
      setSubmitting(true);
      setErrorMessage("");

      await MatchRefereeService.remove(removingAssignmentId);
      toast.success("Đã xóa phân công trọng tài.");
      setRemovingAssignmentId(null);
      await loadData();
      onChanged?.();
    } catch (error) {
      console.error("Cannot remove referee assignment", error);
      setErrorMessage(getErrorMessage(error, "Không thể xóa phân công trọng tài."));
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
            Trận đấu #{matchId ?? "--"} có thể có nhiều trọng tài, nhưng phải có
            đúng 1 trọng tài chính.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <div
          className={`mb-4 rounded-2xl border p-3 text-sm font-bold ${
            mainRefereeCount === 1
              ? "border-green-100 bg-green-50 text-green-700"
              : mainRefereeCount > 1
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-amber-100 bg-amber-50 text-amber-700"
          }`}
        >
          {mainRefereeCount === 1
            ? "Đã có 1 trọng tài chính cho trận đấu."
            : mainRefereeCount > 1
              ? "Dữ liệu hiện có hơn 1 trọng tài chính. Vui lòng xóa phân công dư."
              : "Trận đấu chưa có trọng tài chính."}
        </div>

        <section className="mb-6 rounded-3xl bg-[#f5f3ef] p-4">
          <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-500">
            Thêm phân công
          </h4>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">
                Trọng tài
              </span>
              <select
                value={refereeId}
                onChange={(event) => setRefereeId(event.target.value)}
                disabled={loading || submitting || availableReferees.length === 0}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {availableReferees.length === 0
                    ? "Không còn trọng tài khả dụng"
                    : "Chọn trọng tài"}
                </option>
                {availableReferees.map((referee) => (
                  <option key={referee.id} value={referee.id}>
                    {refereeOptionLabel(referee)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">
                Vai trò
              </span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as RefereeRole)}
                disabled={loading || submitting}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {roleOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.value === "MAIN_REFEREE" && mainRefereeCount >= 1}
                  >
                    {option.label}
                    {option.value === "MAIN_REFEREE" && mainRefereeCount >= 1
                      ? " - đã có"
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ghi chú phân công"
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none md:col-span-2"
            />

            <button
              type="button"
              onClick={handleAssign}
              disabled={
                submitting ||
                loading ||
                !matchId ||
                !refereeId ||
                availableReferees.length === 0
              }
              className="rounded-xl bg-[#008C2F] px-5 py-3 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            >
              {submitting ? "Đang lưu..." : "Thêm trọng tài"}
            </button>
          </div>
        </section>

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
                className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-[1fr_160px_160px_auto] md:items-center"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Trọng tài
                  </p>
                  <p className="mt-1 font-black text-gray-900">
                    {item.refereeName || `Trọng tài #${item.refereeId}`}
                  </p>
                  {item.note && (
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      {item.note}
                    </p>
                  )}
                </div>

                <div className="text-sm font-bold text-gray-600">
                  {item.refereeNationality || "--"}
                </div>

                <div
                  className={`text-sm font-black ${
                    item.role === "MAIN_REFEREE"
                      ? "text-green-700"
                      : "text-gray-700"
                  }`}
                >
                  {roleLabel(item.role)}
                </div>

                <button
                  type="button"
                  onClick={() => setRemovingAssignmentId(item.id)}
                  disabled={submitting}
                  className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          open={removingAssignmentId !== null}
          title="Xóa phân công trọng tài"
          message="Bạn có chắc chắn muốn xóa phân công trọng tài này?"
          confirmText="Xóa"
          cancelText="Hủy"
          danger
          loading={submitting}
          onConfirm={handleConfirmRemove}
          onClose={() => {
            if (!submitting) setRemovingAssignmentId(null);
          }}
        />
      </div>
    </Modal>
  );
}
