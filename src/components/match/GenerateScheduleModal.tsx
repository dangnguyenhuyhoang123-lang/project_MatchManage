import { useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../ConfirmModal";
import { Modal } from "../Modal";
import SeasonService from "../../services/SeasonService";
import { extractApiErrorMessage } from "../../utils/apiError";

type GenerateScheduleModalProps = {
  open: boolean;
  seasonId?: number | null;
  onClose: () => void;
  onGenerated?: () => void;
};

export default function GenerateScheduleModal({
  open,
  seasonId,
  onClose,
  onGenerated,
}: GenerateScheduleModalProps) {
  const [firstMatchDate, setFirstMatchDate] = useState("");
  const [daysBetweenRounds, setDaysBetweenRounds] = useState("7");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validate = () => {
    if (!seasonId) {
      setErrorMessage("Vui lòng chọn mùa giải trước khi sinh lịch.");
      return false;
    }

    if (!firstMatchDate) {
      setErrorMessage("Vui lòng chọn ngày bắt đầu lịch thi đấu.");
      return false;
    }

    const parsedDays = Number(daysBetweenRounds);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      setErrorMessage("Số ngày giữa mỗi vòng phải lớn hơn 0.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirmGenerate = async () => {
    if (!seasonId) return;

    const parsedDays = Number(daysBetweenRounds);

    try {
      setSubmitting(true);
      setErrorMessage("");
      await SeasonService.generateSchedule(seasonId, {
        firstMatchDate,
        daysBetweenRounds: parsedDays,
      });
      toast.success("Đã sinh lịch thi đấu tự động.");
      setConfirmOpen(false);
      onGenerated?.();
      onClose();
    } catch (error) {
      console.error("Cannot generate schedule", error);
      setErrorMessage(extractApiErrorMessage(error));
      toast.error(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" contentClassName="p-0">
      <div className="p-6">
        <div className="mb-6 pr-10">
          <h3 className="text-2xl font-black text-gray-900">
            Sinh lịch thi đấu tự động
          </h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Hệ thống sẽ tạo lịch cho mùa giải đang được chọn.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
              Ngày bắt đầu lịch thi đấu
            </span>
            <input
              type="datetime-local"
              value={firstMatchDate}
              onChange={(event) => setFirstMatchDate(event.target.value)}
              className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
              Số ngày giữa mỗi vòng
            </span>
            <input
              type="number"
              min={1}
              value={daysBetweenRounds}
              onChange={(event) => setDaysBetweenRounds(event.target.value)}
              className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full px-5 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-green-900/15 hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? "Đang sinh lịch..." : "Sinh lịch"}
          </button>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Sinh lịch thi đấu"
        message="Bạn có chắc chắn muốn sinh lịch thi đấu tự động cho mùa giải này?"
        confirmText="Sinh lịch"
        cancelText="Hủy"
        loading={submitting}
        onConfirm={handleConfirmGenerate}
        onClose={() => {
          if (!submitting) setConfirmOpen(false);
        }}
      />
    </Modal>
  );
}
