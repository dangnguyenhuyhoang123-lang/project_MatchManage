import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "../Modal";
import MatchSupervisorReportService, {
  type MatchSupervisorReportRequest,
} from "../../services/MatchSupervisorReportService";
import { extractApiErrorMessage } from "../../utils/apiError";

type MatchSupervisorReportModalProps = {
  open: boolean;
  matchId?: number | null;
  onClose: () => void;
  onSaved?: () => void;
};

const emptyForm: MatchSupervisorReportRequest = {
  supervisorName: "",
  organizationReview: "",
  refereeIssueNote: "",
  playerIssueNote: "",
  stadiumIssueNote: "",
  disciplineRecommendation: "",
};

function normalizeForm(
  form: MatchSupervisorReportRequest,
): MatchSupervisorReportRequest {
  return {
    supervisorName: form.supervisorName?.trim() || null,
    organizationReview: form.organizationReview?.trim() || null,
    refereeIssueNote: form.refereeIssueNote?.trim() || null,
    playerIssueNote: form.playerIssueNote?.trim() || null,
    stadiumIssueNote: form.stadiumIssueNote?.trim() || null,
    disciplineRecommendation: form.disciplineRecommendation?.trim() || null,
  };
}

export default function MatchSupervisorReportModal({
  open,
  matchId,
  onClose,
  onSaved,
}: MatchSupervisorReportModalProps) {
  const [form, setForm] = useState<MatchSupervisorReportRequest>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    const loadReport = async () => {
      if (!matchId) {
        setForm(emptyForm);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        const response = await MatchSupervisorReportService.getByMatch(matchId);
        setForm(response.data ?? emptyForm);
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          setForm(emptyForm);
        } else {
          console.error("Cannot load supervisor report", error);
          setErrorMessage(extractApiErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [open, matchId]);

  const updateField = (
    field: keyof MatchSupervisorReportRequest,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!matchId) {
      setErrorMessage("Không tìm thấy trận đấu để lưu báo cáo.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      await MatchSupervisorReportService.upsert(matchId, normalizeForm(form));
      toast.success("Đã lưu báo cáo giám sát.");
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Cannot save supervisor report", error);
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
            Báo cáo giám sát
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

        {loading ? (
          <div className="py-10 text-center text-sm font-bold text-gray-500">
            Đang tải báo cáo...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Tên giám sát viên"
              value={form.supervisorName ?? ""}
              onChange={(value) => updateField("supervisorName", value)}
            />
            <TextArea
              label="Nhận xét công tác tổ chức"
              value={form.organizationReview ?? ""}
              onChange={(value) => updateField("organizationReview", value)}
            />
            <TextArea
              label="Ghi chú lỗi trọng tài"
              value={form.refereeIssueNote ?? ""}
              onChange={(value) => updateField("refereeIssueNote", value)}
            />
            <TextArea
              label="Ghi chú lỗi cầu thủ"
              value={form.playerIssueNote ?? ""}
              onChange={(value) => updateField("playerIssueNote", value)}
            />
            <TextArea
              label="Ghi chú lỗi BTC sân"
              value={form.stadiumIssueNote ?? ""}
              onChange={(value) => updateField("stadiumIssueNote", value)}
            />
            <TextArea
              label="Đề xuất kỷ luật"
              value={form.disciplineRecommendation ?? ""}
              onChange={(value) =>
                updateField("disciplineRecommendation", value)
              }
            />
          </div>
        )}

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
            disabled={submitting || loading}
            className="rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-green-900/15 hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Lưu báo cáo"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
      />
    </label>
  );
}
