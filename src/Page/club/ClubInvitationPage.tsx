import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import SeasonInvitationService, {
  type InvitationStatus,
  type SeasonInvitationResponse,
} from "../../services/SeasonInvitationService";

type FilterKey = "ALL" | "INVITED";

type DeclineModalState = {
  open: boolean;
  invitation: SeasonInvitationResponse | null;
  reason: string;
  note: string;
};

const declineReasons = [
  "Xung đột lịch thi đấu",
  "Đội hình chưa sẵn sàng",
  "Không phù hợp chiến lược",
  "Lý do tài chính/chi phí",
  "Lý do khác",
];

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}

function isDeadlineTomorrow(value?: string | null) {
  if (!value) return false;

  const deadline = new Date(value);
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    deadline.getFullYear() === tomorrow.getFullYear() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getDate() === tomorrow.getDate()
  );
}

function isExpired(value?: string | null) {
  if (!value) return false;

  return new Date(value).getTime() < Date.now();
}

function statusLabel(status: InvitationStatus) {
  switch (status) {
    case "INVITED":
      return "INVITED";
    case "ACCEPTED":
      return "ACCEPTED";
    case "DECLINED":
      return "DECLINED";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return status;
  }
}

function statusBadgeClass(status: InvitationStatus) {
  switch (status) {
    case "INVITED":
      return "bg-[#E0E0FF] text-[#343D96]";
    case "ACCEPTED":
      return "bg-green-100 text-[#0D631B]";
    case "DECLINED":
      return "bg-red-100 text-red-700";
    case "EXPIRED":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ClubInvitationPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingInvitation, setAcceptingInvitation] =
    useState<SeasonInvitationResponse | null>(null);
  const [invitations, setInvitations] = useState<SeasonInvitationResponse[]>(
    [],
  );

  const [declineModal, setDeclineModal] = useState<DeclineModalState>({
    open: false,
    invitation: null,
    reason: declineReasons[0],
    note: "",
  });

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SeasonInvitationService.getMyInvitations();

      setInvitations(response.data ?? []);
    } catch (err) {
      console.error("Cannot load club invitations", err);
      setError(
        "Không thể tải danh sách lời mời. Vui lòng kiểm tra API /invitations/my.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvitations();
  }, []);

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.status === "INVITED"),
    [invitations],
  );

  const acceptedInvitations = useMemo(
    () => invitations.filter((item) => item.status === "ACCEPTED"),
    [invitations],
  );

  const declinedInvitations = useMemo(
    () => invitations.filter((item) => item.status === "DECLINED"),
    [invitations],
  );

  const expiredInvitations = useMemo(
    () => invitations.filter((item) => item.status === "EXPIRED"),
    [invitations],
  );

  const filteredInvitations = useMemo(() => {
    if (filter === "INVITED") {
      return pendingInvitations;
    }

    return invitations;
  }, [filter, invitations, pendingInvitations]);

  const activeInvitations = filteredInvitations.filter(
    (item) => item.status === "INVITED",
  );

  const historyInvitations = filteredInvitations.filter(
    (item) => item.status !== "INVITED",
  );

  const handleAccept = async (invitation: SeasonInvitationResponse) => {
    setAcceptingInvitation(invitation);
  };

  const handleConfirmAccept = async () => {
    if (!acceptingInvitation) return;

    try {
      setActionLoadingId(acceptingInvitation.id);
      await SeasonInvitationService.accept(acceptingInvitation.id);
      toast.success("Đã chấp nhận lời mời tham gia mùa giải.");
      setAcceptingInvitation(null);
      await loadInvitations();
    } catch (err) {
      console.error("Cannot accept invitation", err);
      toast.error(
        getErrorMessage(err, "Không thể chấp nhận lời mời. Vui lòng thử lại."),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDeclineModal = (invitation: SeasonInvitationResponse) => {
    setDeclineModal({
      open: true,
      invitation,
      reason: declineReasons[0],
      note: "",
    });
  };

  const closeDeclineModal = () => {
    setDeclineModal({
      open: false,
      invitation: null,
      reason: declineReasons[0],
      note: "",
    });
  };

  const handleConfirmDecline = async () => {
    if (!declineModal.invitation) return;

    const finalNote = [declineModal.reason, declineModal.note]
      .filter(Boolean)
      .join(" - ");

    try {
      setActionLoadingId(declineModal.invitation.id);
      await SeasonInvitationService.decline(
        declineModal.invitation.id,
        finalNote,
      );
      closeDeclineModal();
      toast.success("Đã từ chối lời mời.");
      await loadInvitations();
    } catch (err) {
      console.error("Cannot decline invitation", err);
      toast.error("Không thể từ chối lời mời. Vui lòng thử lại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] px-4 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-[#1B1C1A] md:text-4xl">
              Lời mời tham gia mùa giải
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-6 text-[#40493D] md:text-base">
              Quản lý và phản hồi các yêu cầu tham dự giải đấu chuyên nghiệp.
              Hãy quyết định cẩn thận để định hình tương lai của đội bóng.
            </p>
          </div>

          <div className="flex w-max items-center gap-2 rounded-full border border-[#E4E2DE] bg-[#F5F3EF] p-1.5">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                filter === "ALL"
                  ? "bg-white text-[#0D631B] shadow-sm"
                  : "text-[#40493D] hover:text-[#1B1C1A]"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("INVITED")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                filter === "INVITED"
                  ? "bg-white text-[#0D631B] shadow-sm"
                  : "text-[#40493D] hover:text-[#1B1C1A]"
              }`}
            >
              Chờ xử lý ({pendingInvitations.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {loading ? (
              <InvitationSkeleton />
            ) : activeInvitations.length === 0 &&
              historyInvitations.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {activeInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    loading={actionLoadingId === invitation.id}
                    onAccept={() => handleAccept(invitation)}
                    onDecline={() => openDeclineModal(invitation)}
                  />
                ))}

                {historyInvitations.length > 0 && (
                  <div className="mt-4 flex items-center gap-4">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#707A6C]">
                      Lịch sử phản hồi
                    </h2>
                    <div className="h-px flex-1 bg-[#E4E2DE]" />
                  </div>
                )}

                {historyInvitations.map((invitation) => (
                  <HistoryCard key={invitation.id} invitation={invitation} />
                ))}
              </>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <SummaryCard
              pendingCount={pendingInvitations.length}
              acceptedCount={acceptedInvitations.length}
              declinedCount={declinedInvitations.length}
              expiredCount={expiredInvitations.length}
            />

            <div className="relative hidden h-64 overflow-hidden rounded-[32px] bg-[#0D631B] p-6 text-white lg:block">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#ffffff 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#2E7D32] blur-3xl" />

              <div className="relative z-10 flex h-full flex-col justify-end">
                <span className="material-symbols-outlined mb-2 text-4xl">
                  sports_soccer
                </span>
                <h3 className="mb-1 text-xl font-black">Chuẩn bị kỹ lưỡng</h3>
                <p className="text-sm font-medium opacity-90">
                  Tham gia đúng giải đấu quyết định thành bại của cả mùa giải.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {declineModal.open && (
        <DeclineModal
          state={declineModal}
          loading={
            actionLoadingId === declineModal.invitation?.id &&
            declineModal.invitation != null
          }
          onClose={closeDeclineModal}
          onChange={(next) =>
            setDeclineModal((prev) => ({
              ...prev,
              ...next,
            }))
          }
          onConfirm={handleConfirmDecline}
        />
      )}
      <ConfirmModal
        open={acceptingInvitation !== null}
        title="Chấp nhận lời mời"
        message={`Bạn chắc chắn muốn chấp nhận lời mời tham gia ${
          acceptingInvitation?.seasonName ?? "mùa giải này"
        }?`}
        confirmText="Chấp nhận"
        cancelText="Hủy"
        loading={actionLoadingId === acceptingInvitation?.id}
        onConfirm={handleConfirmAccept}
        onClose={() => {
          if (actionLoadingId === null) setAcceptingInvitation(null);
        }}
      />
    </div>
  );
}

function InvitationCard({
  invitation,
  loading,
  onAccept,
  onDecline,
}: {
  invitation: SeasonInvitationResponse;
  loading: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const deadlineTomorrow = isDeadlineTomorrow(invitation.responseDeadline);
  const expired = isExpired(invitation.responseDeadline);

  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-transparent bg-white p-6 shadow-[0_12px_48px_rgba(27,28,26,0.06)] transition hover:border-[#0D631B]/10">
      <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#959EFD]" />

      <div className="flex flex-col gap-6 pl-2 sm:flex-row sm:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${statusBadgeClass(
                invitation.status,
              )}`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              {statusLabel(invitation.status)}
            </span>

            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                deadlineTomorrow || expired ? "text-red-600" : "text-[#40493D]"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {deadlineTomorrow || expired ? "warning" : "schedule"}
              </span>
              {expired
                ? "Đã hết hạn"
                : deadlineTomorrow
                  ? "Hết hạn ngày mai"
                  : `Hết hạn: ${formatDate(invitation.responseDeadline)}`}
            </span>
          </div>

          <h3 className="mb-1 text-xl font-black text-[#1B1C1A] md:text-2xl">
            {invitation.seasonName ?? `Mùa giải #${invitation.seasonId}`}
          </h3>

          <p className="mb-4 text-sm font-bold text-[#0D631B]">
            Mời: {invitation.teamName}
          </p>

          <div className="grid grid-cols-2 gap-4 rounded-[24px] bg-[#F5F3EF] p-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#707A6C]">
                Ngày nhận
              </p>
              <p className="text-sm font-bold text-[#1B1C1A]">
                {formatDate(invitation.invitedAt)}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#707A6C]">
                Hạn phản hồi
              </p>
              <p className="text-sm font-bold text-[#1B1C1A]">
                {formatDate(invitation.responseDeadline)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-w-[140px] justify-end gap-3 sm:flex-col">
          <button
            type="button"
            onClick={onAccept}
            disabled={loading || expired}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#0D631B] to-[#2E7D32] px-6 py-3 text-sm font-black text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">
              check_circle
            </span>
            {expired ? "Đã hết hạn" : loading ? "Đang xử lý..." : "Chấp nhận"}
          </button>

          <button
            type="button"
            onClick={onDecline}
            disabled={loading || expired}
            className="flex flex-1 items-center justify-center rounded-full bg-[#E4E2DE] px-6 py-3 text-sm font-black text-[#1B1C1A] transition hover:bg-[#DBDAD6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Từ chối
          </button>
        </div>
      </div>
    </article>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (typeof data === "string") return data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }

  return fallback;
}

function HistoryCard({ invitation }: { invitation: SeasonInvitationResponse }) {
  return (
    <article className="rounded-[32px] border border-[#E4E2DE] bg-[#F5F3EF]/70 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${statusBadgeClass(
                invitation.status,
              )}`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {invitation.status === "ACCEPTED"
                  ? "check"
                  : invitation.status === "EXPIRED"
                    ? "schedule"
                    : "close"}
              </span>
              {statusLabel(invitation.status)}
            </span>

            <span className="text-xs font-medium text-[#707A6C]">
              Phản hồi: {formatDate(invitation.respondedAt)}
            </span>
          </div>

          <h3 className="text-lg font-black text-[#1B1C1A]">
            {invitation.seasonName ?? `Mùa giải #${invitation.seasonId}`}
          </h3>

          <p className="mb-3 text-sm font-medium text-[#707A6C]">
            {invitation.teamName}
          </p>

          {invitation.responseNote && (
            <div className="flex gap-2 rounded-2xl bg-[#E4E2DE] p-3 text-sm">
              <span className="material-symbols-outlined text-[18px] text-[#707A6C]">
                format_quote
              </span>
              <span className="italic text-[#707A6C]">
                "{invitation.responseNote}"
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  pendingCount,
  acceptedCount,
  declinedCount,
  expiredCount,
}: {
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  expiredCount: number;
}) {
  const total = Math.max(
    pendingCount + acceptedCount + declinedCount + expiredCount,
    1,
  );

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-[0_12px_48px_rgba(27,28,26,0.06)]">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-black text-[#1B1C1A]">
        <span className="material-symbols-outlined text-[#0D631B]">
          pie_chart
        </span>
        Thống kê lời mời
      </h3>

      <div className="space-y-5">
        <SummaryRow
          label="Chờ xử lý"
          value={pendingCount}
          colorClass="text-[#4C56AF]"
          barClass="bg-[#4C56AF]"
          percent={(pendingCount / total) * 100}
        />

        <div className="h-px bg-[#E4E2DE]" />

        <SummaryRow
          label="Đã chấp nhận"
          value={acceptedCount}
          colorClass="text-[#0D631B]"
          barClass="bg-[#0D631B]"
          percent={(acceptedCount / total) * 100}
        />

        <SummaryRow
          label="Đã từ chối"
          value={declinedCount}
          colorClass="text-[#707A6C]"
          barClass="bg-[#707A6C]"
          percent={(declinedCount / total) * 100}
        />

        <SummaryRow
          label="Đã hết hạn"
          value={expiredCount}
          colorClass="text-gray-500"
          barClass="bg-gray-500"
          percent={(expiredCount / total) * 100}
        />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  colorClass,
  barClass,
  percent,
}: {
  label: string;
  value: number;
  colorClass: string;
  barClass: string;
  percent: number;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="mb-1 text-sm font-medium text-[#707A6C]">{label}</p>
        <p className={`text-3xl font-black ${colorClass}`}>
          {String(value).padStart(2, "0")}
        </p>
      </div>

      <div className="h-1 w-16 overflow-hidden rounded-full bg-[#E4E2DE]">
        <div
          className={`h-full ${barClass}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InvitationSkeleton() {
  return (
    <div className="animate-pulse rounded-[32px] bg-white p-6 shadow-[0_12px_48px_rgba(27,28,26,0.06)]">
      <div className="mb-4 flex gap-4">
        <div className="h-6 w-20 rounded-full bg-[#E4E2DE]" />
        <div className="h-6 w-32 rounded-md bg-[#E4E2DE]" />
      </div>
      <div className="mt-4 h-8 w-2/3 rounded-md bg-[#E4E2DE]" />
      <div className="mt-2 h-4 w-1/3 rounded-md bg-[#E4E2DE]" />
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-16 rounded-2xl bg-[#E4E2DE]" />
        <div className="h-16 rounded-2xl bg-[#E4E2DE]" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-[#BFCABA] bg-white p-10 text-center">
      <span className="material-symbols-outlined mb-3 text-5xl text-[#707A6C]">
        mark_email_unread
      </span>
      <h3 className="mb-2 text-xl font-black text-[#1B1C1A]">
        Chưa có lời mời nào
      </h3>
      <p className="text-sm font-medium text-[#707A6C]">
        Khi ban tổ chức gửi lời mời tham gia mùa giải, lời mời sẽ xuất hiện tại
        đây.
      </p>
    </div>
  );
}

function DeclineModal({
  state,
  loading,
  onClose,
  onChange,
  onConfirm,
}: {
  state: DeclineModalState;
  loading: boolean;
  onClose: () => void;
  onChange: (next: Partial<DeclineModalState>) => void;
  onConfirm: () => void;
}) {
  const invitation = state.invitation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng modal"
        className="absolute inset-0 bg-[#1B1C1A]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-[32px] bg-white p-8 shadow-[0_12px_48px_rgba(27,28,26,0.16)]">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined">cancel</span>
            </div>

            <h3 className="text-xl font-black text-[#1B1C1A]">
              Từ chối lời mời
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#707A6C] transition hover:bg-[#F5F3EF] hover:text-[#1B1C1A]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mb-6 text-sm font-medium leading-6 text-[#707A6C]">
          Bạn đang từ chối lời mời tham gia{" "}
          <strong className="text-[#1B1C1A]">
            {invitation?.seasonName ?? "mùa giải này"}
          </strong>
          . Vui lòng cung cấp lý do để ban tổ chức nắm thông tin.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#1B1C1A]">
              Lý do từ chối
            </label>
            <select
              value={state.reason}
              onChange={(event) => onChange({ reason: event.target.value })}
              className="w-full rounded-2xl border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-medium text-[#1B1C1A] outline-none focus:border-[#0D631B]"
            >
              {declineReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1B1C1A]">
              Ghi chú thêm
            </label>
            <textarea
              value={state.note}
              onChange={(event) => onChange({ note: event.target.value })}
              rows={3}
              placeholder="Nhập chi tiết bổ sung..."
              className="w-full resize-none rounded-2xl border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-medium text-[#1B1C1A] outline-none focus:border-[#0D631B]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2.5 text-sm font-bold text-[#707A6C] transition hover:bg-[#F5F3EF]"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
