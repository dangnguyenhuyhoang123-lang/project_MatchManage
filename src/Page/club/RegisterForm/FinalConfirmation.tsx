import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { RegistrationSummaryDTO } from "../../../model/Registration";
import RegistrationService from "../../../services/RegistrationService";
import type { SystemRule } from "../../../services/SystemRuleService";
import type { RegistrationDraft, SelectedPlayer } from "./RegisterFormMatch";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../services/websocket/NotificationSocketService";
import { getErrorMessage } from "../../../utils/errorUtils";
type Props = {
  setStep: (step: number) => void;
  draft: RegistrationDraft;
  onTeamChange: (team: Partial<RegistrationDraft["team"]>) => void;
  onSubmitted?: () => void;
  rule?: SystemRule | null;
};

const roleLabels: Record<string, string> = {
  HEAD_COACH: "Huấn luyện viên trưởng",
  ASSISTANT_COACH: "Trợ lý huấn luyện viên",
  GOALKEEPER_COACH: "Huấn luyện viên thủ môn",
  FITNESS_COACH: "Huấn luyện viên thể lực",
  TEAM_DOCTOR: "Bác sĩ đội bóng",
};

const grassLabels = {
  Standard: "Tự nhiên",
  Synthetic: "Nhân tạo",
  Premium: "Hybrid",
};

const getPlayerShirtNumber = (player: SelectedPlayer) =>
  Number(player.shirtNumber ?? player.number ?? 0);

const getPlayerPosition = (player: SelectedPlayer) =>
  player.position || "Cầu thủ";

const getPlayerIdCode = (player: SelectedPlayer) =>
  String(
    player.idCode ?? player.id_code ?? player.identityCode ?? player.cccd ?? "",
  ).trim();

const getPlayerBirthDate = (player: SelectedPlayer) =>
  player.birthDay ?? player.birthDate ?? player.dateOfBirth ?? "";

const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
};

const getCoachIdCode = (coach: RegistrationDraft["coaches"][number]) =>
  String(
    coach.idCode ?? coach.id_code ?? coach.identityCode ?? coach.cccd ?? "",
  ).trim();

const isVietnamCountry = (value?: string) => {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

  return ["viet nam", "vietnam", "vn"].includes(normalized);
};

const normalizeCoachRole = (role?: string) =>
  (role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const isHeadCoachRole = (role?: string) => {
  const normalized = normalizeCoachRole(role);
  return (
    normalized.includes("head_coach") ||
    normalized.includes("hlv truong") ||
    normalized.includes("huan luyen vien truong")
  );
};

const FinalConfirmation: React.FC<Props> = ({
  setStep,
  draft,
  onTeamChange,
  onSubmitted,
  rule,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSummary, setSubmittedSummary] =
    useState<RegistrationSummaryDTO | null>(null);

  const allPlayers = useMemo(() => draft.players, [draft.players]);

  const missingItems = useMemo(() => {
    const missing: string[] = [];

    if (!draft.season?.id) {
      missing.push("Chưa chọn mùa giải");
    }

    if (!draft.team?.id) {
      missing.push("Chưa chọn đội đăng ký");
    }

    const minCoaches = rule?.minCoaches ?? 1;
    const maxCoaches = rule?.maxCoaches ?? 8;

    if (draft.coaches.length < minCoaches) {
      missing.push(`Ban huấn luyện chưa đủ tối thiểu ${minCoaches} thành viên`);
    }

    if (draft.coaches.length > maxCoaches) {
      missing.push(`Ban huấn luyện vượt quá tối đa ${maxCoaches} thành viên`);
    }

    const headCoachCount = draft.coaches.filter((coach) =>
      isHeadCoachRole(coach.role),
    ).length;

    if (headCoachCount !== 1) {
      missing.push("Ban huấn luyện phải có đúng 01 HLV trưởng");
    }

    const coachIdCodes = draft.coaches.map(getCoachIdCode).filter(Boolean);
    if (coachIdCodes.length !== draft.coaches.length) {
      missing.push("Có HLV thiếu mã định danh idCode");
    }

    const minPlayers = rule?.minPlayers ?? 14;
    const maxPlayers = rule?.maxPlayers ?? 30;
    const minAge = rule?.minAge ?? 16;
    const maxAge = rule?.maxAge ?? 40;
    const maxForeignPlayers = rule?.maxForeignPlayers ?? 3;

    if (allPlayers.length < minPlayers) {
      missing.push(`Danh sách cầu thủ chưa đủ tối thiểu ${minPlayers} người`);
    }

    if (allPlayers.length > maxPlayers) {
      missing.push(`Danh sách cầu thủ vượt quá tối đa ${maxPlayers} người`);
    }

    const playerIdCodes = allPlayers.map(getPlayerIdCode).filter(Boolean);
    if (playerIdCodes.length !== allPlayers.length) {
      missing.push("Có cầu thủ thiếu mã định danh idCode");
    }

    const invalidBirthDateCount = allPlayers.filter(
      (player) => calculateAge(getPlayerBirthDate(player)) === null,
    ).length;
    if (invalidBirthDateCount > 0) {
      missing.push(`${invalidBirthDateCount} cầu thủ chưa có ngày sinh hợp lệ`);
    }

    const invalidAgeCount = allPlayers.filter((player) => {
      const age = calculateAge(getPlayerBirthDate(player));
      return age !== null && (age < minAge || age > maxAge);
    }).length;
    if (invalidAgeCount > 0) {
      missing.push(
        `${invalidAgeCount} cầu thủ không nằm trong độ tuổi ${minAge}-${maxAge}`,
      );
    }

    const foreignCount = allPlayers.filter(
      (player) =>
        Boolean(player.nationality) && !isVietnamCountry(player.nationality),
    ).length;
    if (foreignCount > maxForeignPlayers) {
      missing.push(
        `Số ngoại binh vượt quá tối đa ${maxForeignPlayers} cầu thủ`,
      );
    }

    if (!draft.stadium.name.trim() || !draft.stadium.address.trim()) {
      missing.push("Thông tin sân vận động chưa đầy đủ");
    }

    if (Number(draft.stadium.capacity) < 10000) {
      missing.push("Sân phải có sức chứa tối thiểu 10.000 người");
    }

    if (Number(draft.stadium.fifaStarRating) < 2) {
      missing.push("Chuẩn sao sân phải tối thiểu 2");
    }

    if (!isVietnamCountry(draft.stadium.country)) {
      missing.push("Quốc gia sân phải là Việt Nam/Vietnam/Viet Nam/VN");
    }

    return missing;
  }, [allPlayers.length, draft, rule]);

  const canSubmit = missingItems.length === 0 && isConfirmed && !isSubmitting;
  const foreignPlayerCount = useMemo(
    () =>
      allPlayers.filter((player) => {
        const nationality = (player.nationality ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();
        return (
          Boolean(nationality) &&
          !["viet nam", "vietnam", "vn"].includes(nationality)
        );
      }).length,
    [allPlayers],
  );

  const payload = useMemo(() => {
    if (!draft.season?.id) {
      return null;
    }

    return {
      seasonID: draft.season.id,
      teamInfo: {
        id: draft.team.id,
        homeKitColor: draft.team.homeKitColor,
        awayKitColor: draft.team.awayKitColor,
        homeKitImageUrl: draft.team.homeKitImageUrl,
        awayKitImageUrl: draft.team.awayKitImageUrl,
      },
      stadiumInfo: {
        name: draft.stadium.name.trim(),
        address: draft.stadium.address.trim(),
        capacity: Number(draft.stadium.capacity) || 0,
        grass: draft.stadium.grass,
        country: draft.stadium.country || "Việt Nam",
        fifaStarRating: Number(draft.stadium.fifaStarRating) || 2,
        certificateUrl: draft.stadium.certificateUrl || null,
      },
      listPlayerInfo: allPlayers
        .filter((player) => Number.isFinite(Number(player.id)))
        .map((player) => ({
          playerId: Number(player.id),
          shirtNumber: getPlayerShirtNumber(player),
          position: getPlayerPosition(player),
        })),
      listCoachInfo: draft.coaches
        .filter((coach) => coach.coachId != null)
        .map((coach) => ({
          coachId: Number(coach.coachId),
          role: coach.role,
        })),
    };
  }, [allPlayers, draft]);
  const completionPercent = Math.round(((5 - missingItems.length) / 5) * 100);

  const handleSubmit = async () => {
    if (!payload || !canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await RegistrationService.submitRegistration(payload);
      setSubmittedSummary(response.data);
      toast.success("Gửi hồ sơ đăng ký thành công.");
      onSubmitted?.();
    } catch (error) {
      console.error("Lỗi khi gửi đơn đăng ký:", error);
      toast.error(
        getErrorMessage(
          error,
          "Không thể gửi đơn đăng ký. Vui lòng kiểm tra lại dữ liệu.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSubmittedRegistration = useCallback(async () => {
    if (!submittedSummary?.id) return;

    try {
      const response = await RegistrationService.getRegistrationById(
        submittedSummary.id,
      );
      const detail = response.data;
      setSubmittedSummary((current) =>
        current
          ? {
              ...current,
              status: detail.status,
              note: detail.note,
            }
          : current,
      );
    } catch (error) {
      console.error("Lỗi khi tải trạng thái hồ sơ đăng ký:", error);
    }
  }, [submittedSummary?.id]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.referenceId === submittedSummary?.id &&
        (event.action === "REFETCH_REGISTRATIONS" ||
          event.referenceType === "REGISTRATION_TEAM")
      ) {
        loadSubmittedRegistration();
      }
    },
    [loadSubmittedRegistration, submittedSummary?.id],
  );

  useRealtimeEvent(handleRealtimeEvent);

  return (
    <div className="pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d631b] to-[#2e7d32] p-8 md:p-10 text-white shadow-xl shadow-green-900/20 mb-8">
        <div className="absolute -right-12 -bottom-16 opacity-10">
          <span className="material-symbols-outlined text-[220px]">
            assignment_turned_in
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">
                workspace_premium
              </span>
              Bước 5 / 5
            </span>

            <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-tight font-['Be_Vietnam_Pro']">
              Kiểm tra & xác nhận hồ sơ
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-white/75 leading-relaxed">
              Dữ liệu bên dưới được lấy trực tiếp từ các bước bạn vừa chọn trong
              form đăng ký.
            </p>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 backdrop-blur border border-white/10 min-w-[220px]">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-white/70">Tiến độ</span>
              <span className="text-3xl font-black">{completionPercent}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              icon="emoji_events"
              label="Mùa giải"
              value={draft.season?.name || draft.season?.year || "Chưa chọn"}
              tone="bg-amber-50 text-amber-700"
            />
            <SummaryCard
              icon="shield"
              label="Câu lạc bộ"
              value={draft.team.name}
              tone="bg-green-50 text-green-700"
            />
            <SummaryCard
              icon="stadium"
              label="Sân vận động"
              value={draft.stadium.name || "Chưa nhập"}
              tone="bg-blue-50 text-blue-700"
            />
            <SummaryCard
              icon="verified"
              label="Trạng thái"
              value={missingItems.length === 0 ? "Sẵn sàng gửi" : "Cần bổ sung"}
              tone={
                missingItems.length === 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }
            />
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="mb-5">
              <h3 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                Áo đấu
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <KitInput
                label="Màu áo chính thức"
                value={draft.team.homeKitColor ?? ""}
                onChange={(value) => onTeamChange({ homeKitColor: value })}
              />
              <KitInput
                label="Màu áo dự bị"
                value={draft.team.awayKitColor ?? ""}
                onChange={(value) => onTeamChange({ awayKitColor: value })}
              />
              <KitInput
                label="URL ảnh áo chính thức"
                value={draft.team.homeKitImageUrl ?? ""}
                type="url"
                onChange={(value) => onTeamChange({ homeKitImageUrl: value })}
              />
              <KitInput
                label="URL ảnh áo dự bị"
                value={draft.team.awayKitImageUrl ?? ""}
                type="url"
                onChange={(value) => onTeamChange({ awayKitImageUrl: value })}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                  Tổng quan đăng ký
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Số liệu được tổng hợp từ danh sách bạn đã chọn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="sports_soccer"
                label="Cầu thủ đăng ký"
                value={String(allPlayers.length).padStart(2, "0")}
              />
              <StatCard
                icon="public"
                label="Ngoại binh"
                value={String(foreignPlayerCount).padStart(2, "0")}
              />
              <StatCard
                icon="manage_accounts"
                label="Ban huấn luyện"
                value={String(draft.coaches.length).padStart(2, "0")}
              />
              <StatCard
                icon="event_seat"
                label="Sức chứa sân"
                value={draft.stadium.capacity.toLocaleString("vi-VN")}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <ReviewSection
              className="col-span-12 lg:col-span-7"
              title="Danh sách cầu thủ"
              description={`${allPlayers.length} cầu thủ đã được chọn`}
              editStep={3}
              setStep={setStep}
            >
              <div className="space-y-3">
                {allPlayers.slice(0, 5).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3"
                  >
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-12 w-12 rounded-xl object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black">
                        {player.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 truncate">
                        {player.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {getPlayerPosition(player)} • Số{" "}
                        {getPlayerShirtNumber(player) || "--"}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase text-green-700">
                      Hợp lệ
                    </span>
                  </div>
                ))}

                {allPlayers.length === 0 && (
                  <EmptyLine text="Chưa có cầu thủ nào được chọn." />
                )}

                {allPlayers.length > 5 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-4 text-sm font-bold text-gray-500">
                    ... và {allPlayers.length - 5} cầu thủ khác
                  </div>
                )}
              </div>
            </ReviewSection>

            <ReviewSection
              className="col-span-12 lg:col-span-5"
              title="Ban huấn luyện"
              description={`${draft.coaches.length} thành viên đã được chọn`}
              editStep={2}
              setStep={setStep}
            >
              <div className="space-y-3">
                {draft.coaches.slice(0, 5).map((coach) => (
                  <div
                    key={coach.assignmentId ?? coach.coachId ?? coach.name}
                    className="rounded-2xl bg-[#f5f3ef] p-4"
                  >
                    <p className="font-black text-gray-900">{coach.name}</p>
                    <p className="mt-1 text-xs font-bold text-green-700">
                      {roleLabels[coach.role] ?? coach.role}
                    </p>
                  </div>
                ))}

                {draft.coaches.length === 0 && (
                  <EmptyLine text="Chưa có thành viên ban huấn luyện." />
                )}
              </div>
            </ReviewSection>
          </div>

          <ReviewSection
            title="Sân vận động"
            description="Thông tin địa điểm thi đấu chính thức"
            editStep={4}
            setStep={setStep}
          >
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
              <img
                src={draft.stadium.image}
                alt={draft.stadium.name}
                className="h-40 w-full rounded-2xl object-cover bg-[#f5f3ef]"
              />
              <div className="rounded-2xl bg-[#f5f3ef] p-5">
                <h4 className="text-xl font-black text-gray-900">
                  {draft.stadium.name}
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  {draft.stadium.address}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <InfoPill
                    label="Sức chứa"
                    value={`${draft.stadium.capacity.toLocaleString("vi-VN")} người`}
                  />
                  <InfoPill
                    label="Mặt cỏ"
                    value={grassLabels[draft.stadium.grass]}
                  />
                </div>
              </div>
            </div>
          </ReviewSection>
        </section>

        <aside className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro'] mb-6">
              Trạng thái hồ sơ
            </h3>

            <div className="space-y-4">
              {[
                {
                  text: "Đã chọn mùa giải đăng ký",
                  passed: Boolean(draft.season?.id),
                },
                {
                  text: `Ban huấn luyện đủ tối thiểu ${rule?.minCoaches ?? 1} thành viên`,
                  passed: draft.coaches.length >= (rule?.minCoaches ?? 1),
                },
                {
                  text: "Ban huấn luyện có đúng 01 HLV trưởng",
                  passed:
                    draft.coaches.filter((coach) => isHeadCoachRole(coach.role))
                      .length === 1,
                },
                {
                  text: `Danh sách cầu thủ đủ tối thiểu ${rule?.minPlayers ?? 14} người`,
                  passed: allPlayers.length >= (rule?.minPlayers ?? 14),
                },
                {
                  text: "Thông tin sân vận động đầy đủ",
                  passed:
                    Boolean(draft.stadium.name.trim()) &&
                    Boolean(draft.stadium.address.trim()),
                },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined ${
                      item.passed ? "text-green-700" : "text-red-500"
                    }`}
                  >
                    {item.passed ? "check_circle" : "cancel"}
                  </span>
                  <p className="text-sm font-semibold text-gray-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {missingItems.length > 0 && (
              <div className="mt-8 rounded-2xl bg-red-50 p-5 border border-red-100">
                <p className="font-black text-red-600">Cần bổ sung</p>
                <ul className="mt-2 space-y-1 text-xs text-red-500">
                  {missingItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-[#f5f3ef] rounded-[2rem] border border-gray-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="commit"
                checked={isConfirmed}
                onChange={() => setIsConfirmed((prev) => !prev)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-700 focus:ring-green-700/20 cursor-pointer"
              />
              <label htmlFor="commit" className="cursor-pointer">
                <h3 className="font-black text-gray-900 font-['Be_Vietnam_Pro']">
                  Cam kết thông tin
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Tôi xác nhận các thông tin trong hồ sơ đăng ký là chính xác,
                  trung thực và đồng ý tuân thủ điều lệ giải đấu.
                </p>
              </label>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                assignment
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Hồ sơ {draft.team.name}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Kiểm tra lần cuối trước khi gửi
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Quay lại
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </button>
          </div>
        </div>
      </div>

      {submittedSummary && (
        <div className="fixed bottom-28 right-8 z-50 max-w-sm rounded-2xl border border-green-100 bg-white/90 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <div>
              <h4 className="font-black text-gray-900">Đã gửi hồ sơ</h4>
              <p className="text-xs font-semibold text-gray-500">
                Mã hồ sơ #{submittedSummary.id} • Trạng thái{" "}
                {submittedSummary.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: string;
}) => (
  <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <h3 className="mt-1 truncate text-lg font-black text-gray-900">
          {value}
        </h3>
      </div>
    </div>
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl bg-[#f5f3ef] p-5 border border-gray-100">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>
  </div>
);

const ReviewSection = ({
  title,
  description,
  editStep,
  setStep,
  className = "",
  children,
}: {
  title: string;
  description: string;
  editStep: number;
  setStep: (step: number) => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 ${className}`.trim()}
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setStep(editStep)}
        className="text-xs font-black text-green-700 hover:underline"
      >
        Chỉnh sửa
      </button>
    </div>
    {children}
  </div>
);

const EmptyLine = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-4 text-sm font-bold text-gray-400">
    {text}
  </div>
);

const InfoPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white p-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className="mt-1 font-black text-gray-900">{value}</p>
  </div>
);

const KitInput = ({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "url";
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-700/20"
      placeholder={type === "url" ? "https://..." : undefined}
    />
  </label>
);

export default FinalConfirmation;
