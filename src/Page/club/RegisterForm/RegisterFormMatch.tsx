import React, { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import type { GrassType } from "../../../model/Registration";
import { AppLayout } from "../../../layouts/AppLayout";
import CoachRegistration from "./CoachRegistration";
import FinalConfirmation from "./FinalConfirmation";
import PlayerRegistration from "./PlayerRegistration";
import RegistrationPortal from "./RegistrationPortal";
import StadiumRegistration from "./StadiumRegistration";
import SystemRuleService, {
  type SystemRule,
} from "../../../services/SystemRuleService";
import TeamService from "../../../services/TeamService";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";
import { calculateAge } from "../../../utils/registrationValidationUtils";

// Type mùa giải được chọn đăng ký
export type SelectedSeason = {
  id: number;
  name?: string;
  year?: string;
  leagueName?: string;
  startDate?: string;
  endDate?: string;
  systemRuleId?: number;
};

// Type huấn luyện viên được chọn
export type SelectedCoach = {
  assignmentId?: number;
  coachId?: number;
  name: string;
  role: string;
  idCode?: string;
  id_code?: string;
  identityCode?: string;
  cccd?: string;
  nationality?: string;
  avatar?: string;
  status: string;
  assignedDate?: string;
};

// Type cầu thủ được chọn
export type SelectedPlayer = {
  id: number;
  playerId?: number;
  name: string;
  position?: string;
  detailPosition?: string | null;
  shirtNumber?: number;
  number?: number;
  avatar?: string | null;
  idCode?: string | null;
  id_code?: string | null;
  identityCode?: string | null;
  cccd?: string | null;
  birthDay?: string | null;
  birthDate?: string | null;
  dateOfBirth?: string;
  nationality?: string;
  playerType?: string;
  type?: string;
};

// Type thông tin sân đăng ký
export type StadiumDraft = {
  name: string;
  clubName: string;
  address: string;
  capacity: number;
  grass: GrassType;
  image?: string;

  country: string;
  fifaStarRating: number;
  certificateUrl?: string;
};

// Thông tin dùng để lưu nháp
export type RegistrationDraft = {
  season: SelectedSeason | null;
  team: {
    id: number;
    name: string;

    homeKitColor?: string;
    awayKitColor?: string;
    homeKitImageUrl?: string;
    awayKitImageUrl?: string;
  };
  coaches: SelectedCoach[];
  players: SelectedPlayer[];
  mainPlayers?: SelectedPlayer[];
  subPlayers?: SelectedPlayer[];
  stadium: StadiumDraft;
};

const defaultDraft: RegistrationDraft = {
  season: null,
  team: {
    id: 1,
    name: "Becamex Bình Dương",
  },
  coaches: [],
  players: [],
  stadium: {
    name: "Starlight Arena",
    clubName: "Becamex Bình Dương",
    address: "123 Pitch Flow Avenue, Sport District, HCMC",
    capacity: 65000,
    grass: "Standard",
    image:
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1600&auto=format&fit=crop",
    country: "Việt Nam",
    fifaStarRating: 2,
  },
};

export const DRAFT_STORAGE_KEY = "club_registration_draft";

// Xử lý players(gộp danh sách cầu thủ).
function mergePlayers(...groups: Array<SelectedPlayer[] | undefined>) {
  const map = new Map<number, SelectedPlayer>();

  groups
    .flatMap((group) => group ?? [])
    .forEach((player) => {
      if (player?.id != null && !map.has(player.id)) {
        map.set(player.id, player);
      }
    });

  return Array.from(map.values());
}

// Biến lưu trữ các bước đăng ký
const steps = [
  { step: 1, label: "Chọn giải đấu" },
  { step: 2, label: "Danh sách ban huấn luyện" },
  { step: 3, label: "Danh sách cầu thủ" },
  { step: 4, label: "Sân vận động" },
  { step: 5, label: "Kiểm tra & xác nhận" },
];

// Xử lý saved draft(nếu lưu thì lấy trong localstorage , k lưu trả default ).
function readSavedDraft(): RegistrationDraft {
  if (typeof window === "undefined") return defaultDraft;

  const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!rawDraft) return defaultDraft;

  try {
    const savedDraft = JSON.parse(rawDraft) as Partial<RegistrationDraft>;
    const players = mergePlayers(
      savedDraft.players,
      savedDraft.mainPlayers,
      savedDraft.subPlayers,
    );

    return {
      ...defaultDraft,
      ...savedDraft,
      team: {
        ...defaultDraft.team,
        ...savedDraft.team,
      },
      stadium: {
        ...defaultDraft.stadium,
        ...savedDraft.stadium,
      },
      coaches: savedDraft.coaches ?? defaultDraft.coaches,
      players,
      mainPlayers: [],
      subPlayers: [],
    };
  } catch {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return defaultDraft;
  }
}

// Chuẩn hóa role text.
function normalizeRoleText(role?: string) {
  return (role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

// Lấy coach role key(kiểm tra role , trả về giá trị thực hiện validate 1 HLV trưởng).
function getCoachRoleKey(role?: string) {
  const normalizedRole = normalizeRoleText(role);

  if (
    normalizedRole.includes("head_coach") ||
    normalizedRole.includes("hlv truong") ||
    normalizedRole.includes("huan luyen vien truong")
  ) {
    return "headCoach";
  }

  if (
    normalizedRole.includes("assistant") ||
    normalizedRole.includes("tro ly") ||
    normalizedRole.includes("troly")
  ) {
    return "assistant";
  }

  if (
    normalizedRole.includes("team_doctor") ||
    normalizedRole.includes("doctor") ||
    normalizedRole.includes("bac si") ||
    normalizedRole.includes("y te")
  ) {
    return "doctor";
  }

  return "other";
}

// Lấy coach id code (thực hiện validate kiểm tra có thiếu idcode hay không).
function getCoachIdCode(coach: SelectedCoach) {
  return String(
    coach.idCode ?? coach.id_code ?? coach.identityCode ?? coach.cccd ?? "",
  ).trim();
}

// Lấy player id code.(thực hiện validate kiểm tra có thiếu idcode hay không)
function getPlayerIdCode(player: SelectedPlayer) {
  return String(
    player.idCode ?? player.id_code ?? player.identityCode ?? player.cccd ?? "",
  ).trim();
}

// Lấy player birth date(lấy ngày sinh nhật để kiểm tra độ tuổi phù hợp).
function getPlayerBirthDate(player: SelectedPlayer) {
  return player.birthDay ?? player.birthDate ?? player.dateOfBirth ?? "";
}

// Chuẩn hóa country(Bỏ dấu và lower-case ).
function normalizeCountry(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Xử lý is foreign player(Lấy quốc tích để thực hiện validate số ccầuthu nước ngoài).
function isForeignPlayer(player: SelectedPlayer) {
  const type = String(player.playerType ?? player.type ?? "").toUpperCase();
  if (type === "FOREIGN") return true;
  if (type === "DOMESTIC") return false;

  const nationality = normalizeCountry(player.nationality);
  return (
    Boolean(nationality) && !["viet nam", "vietnam", "vn"].includes(nationality)
  );
}

// Lấy completed steps.
function getStepValidationMessage(
  stepIndex: number,
  draft: RegistrationDraft,
  rule?: SystemRule | null,
): string | null {
  const coachRoleCounts = draft.coaches.reduce<Record<string, number>>(
    (counts, coach) => {
      const roleKey = getCoachRoleKey(coach.role);
      counts[roleKey] = (counts[roleKey] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const totalPlayers = draft.players.length;
  const minCoaches = rule?.minCoaches ?? 1;
  const maxCoaches = rule?.maxCoaches ?? 8;
  const minPlayers = rule?.minRegistrationPlayers ?? rule?.minPlayers ?? 14;
  const maxPlayers = rule?.maxPlayers ?? 30;
  const minAge = rule?.minAge ?? 16;
  const maxAge = rule?.maxAge ?? 40;
  const maxForeignPlayers = rule?.maxForeignPlayers ?? 3;
  const coachIdCodes = draft.coaches.map(getCoachIdCode).filter(Boolean);
  const playerIdCodes = draft.players.map(getPlayerIdCode).filter(Boolean);
  const playerAges = draft.players.map((player) =>
    calculateAge(getPlayerBirthDate(player)),
  );
  const hasValidCoachIdCodes = coachIdCodes.length === draft.coaches.length;
  const hasValidPlayerIdCodes = playerIdCodes.length === draft.players.length;
  const missingPlayerAgeCount = playerAges.filter((age) => age === null).length;
  const hasValidPlayerAges =
    playerAges.length === draft.players.length &&
    playerAges.every((age) => age !== null && age >= minAge && age <= maxAge);
  const foreignCount = draft.players.filter(isForeignPlayer).length;

  switch (stepIndex) {
    case 1:
      if (!draft.season?.id) {
        return "Vui lòng chọn mùa giải trước khi tiếp tục.";
      }
      return null;
    case 2:
      if (draft.coaches.length < minCoaches) {
        return `Ban huấn luyện cần tối thiểu ${minCoaches} thành viên.`;
      }
      if (draft.coaches.length > maxCoaches) {
        return `Ban huấn luyện vượt quá tối đa ${maxCoaches} thành viên.`;
      }
      if ((coachRoleCounts.headCoach ?? 0) !== 1) {
        return "Hồ sơ cần đúng 01 huấn luyện viên trưởng.";
      }
      if (!hasValidCoachIdCodes) {
        return "Có huấn luyện viên thiếu mã định danh idCode.";
      }
      return null;
    case 3:
      if (totalPlayers < minPlayers) {
        return `Danh sách cầu thủ cần tối thiểu ${minPlayers} người.`;
      }
      if (totalPlayers > maxPlayers) {
        return `Danh sách cầu thủ vượt quá tối đa ${maxPlayers} người.`;
      }
      if (!hasValidPlayerIdCodes) {
        return "Có cầu thủ thiếu mã định danh idCode.";
      }
      if (missingPlayerAgeCount > 0) {
        return "Có cầu thủ chưa có ngày sinh hợp lệ.";
      }
      if (!hasValidPlayerAges) {
        return `Có cầu thủ không nằm trong độ tuổi quy định từ ${minAge} đến ${maxAge}.`;
      }
      if (foreignCount > maxForeignPlayers) {
        return `Số ngoại binh vượt quá tối đa ${maxForeignPlayers} cầu thủ.`;
      }
      return null;
    case 4:
      if (!draft.stadium.name.trim()) {
        return "Vui lòng nhập tên sân vận động.";
      }
      if (!draft.stadium.address.trim()) {
        return "Vui lòng nhập địa chỉ sân vận động.";
      }
      if (!draft.stadium.country.trim()) {
        return "Vui lòng nhập quốc gia của sân vận động.";
      }
      if (Number(draft.stadium.capacity) < 10000) {
        return "Sân vận động cần có sức chứa tối thiểu 10.000 người.";
      }
      if (Number(draft.stadium.fifaStarRating) < 2) {
        return "Chuẩn sao sân vận động tối thiểu là 2.";
      }
      return null;
    default:
      return null;
  }
}

// Lấy completed steps(tính trạng thái hoàn thành của từng bước dựa trên draft và SystemRule).
function getCompletedSteps(
  draft: RegistrationDraft,
  rule?: SystemRule | null,
): Record<number, boolean> {
  return {
    1: getStepValidationMessage(1, draft, rule) === null,
    2: getStepValidationMessage(2, draft, rule) === null,
    3: getStepValidationMessage(3, draft, rule) === null,
    4: getStepValidationMessage(4, draft, rule) === null,
    5: false,
  };
}

// Lấy bước cao nhất được truy cập.
function getHighestAllowedStep(completedSteps: Record<number, boolean>) {
  for (let currentStep = 1; currentStep <= 4; currentStep += 1) {
    if (!completedSteps[currentStep]) {
      return currentStep;
    }
  }

  return 5;
}

const RegisterFormMatch: React.FC = () => {
  // Lấy id câu lạc bộ đang quản lý
  const { currentClubId, authLoading } = useCurrentClubId();

  // Lưu trữ các bước
  const [step, setStep] = useState(1);

  // Mỗi bước đăng ký cập nhật draf(bản nháp)
  const [draft, setDraft] = useState<RegistrationDraft>(() => readSavedDraft());

  // Thông báo lưu nháp / reset form và lỗi điều hướng
  const [draftMessage, setDraftMessage] = useState("");

  // Lấy rule mùa giải đang chọn
  const [rule, setRule] = useState<SystemRule | null>(null);

  useEffect(() => {
    if (authLoading || !currentClubId) return;

    TeamService.getTeamById(currentClubId)
      .then((team) => {
        setDraft((prev) => ({
          ...prev,
          team: {
            ...prev.team,
            id: currentClubId,
            name: team?.name ?? prev.team.name ?? "Câu lạc bộ",
          },
          stadium: {
            ...prev.stadium,
            clubName: team?.name ?? prev.stadium.clubName,
          },
        }));
      })
      .catch((error) => {
        console.error("Không thể đồng bộ thông tin CLB hiện tại:", error);
        setDraft((prev) => ({
          ...prev,
          team: {
            ...prev.team,
            id: currentClubId,
          },
        }));
      });
  }, [authLoading, currentClubId]);

  useEffect(() => {
    if (draft.season?.systemRuleId) {
      SystemRuleService.getById(draft.season.systemRuleId)
        .then((res) => {
          setRule(res.data);
        })
        .catch((err) => {
          console.error("Lỗi khi tải bộ luật giải đấu:", err);
        });
    } else {
      setRule(null);
    }
  }, [draft.season?.systemRuleId]);

  const selectedSeasonLabel =
    draft.season?.name || draft.season?.year || draft.season?.leagueName;

  // hiển thị các bước đã hoàn chỉnh
  const completedSteps = useMemo(
    () => getCompletedSteps(draft, rule),
    [draft, rule],
  );
  const highestAllowedStep = useMemo(
    () => Math.max(step, getHighestAllowedStep(completedSteps)),
    [completedSteps, step],
  );

  // Biến chặn thao tác khi câu lạc bộ còn hoạt động
  const canNavigateTab = !authLoading;

  // Xử lý go to step.
  const goToStep = (nextStep: number) => {
    if (!canNavigateTab) {
      const message = "Vui lòng chờ hệ thống tải xong dữ liệu.";
      setDraftMessage(message);
      toast.warning(message);
      return;
    }

    if (nextStep > step) {
      for (let currentStep = 1; currentStep < nextStep; currentStep += 1) {
        const message = getStepValidationMessage(currentStep, draft, rule);

        if (message) {
          setDraftMessage(message);
          toast.error(message);
          setStep(currentStep);
          return;
        }
      }
    }

    setDraftMessage("");
    setStep(nextStep);
  };

  // Xử lý lưu dữ liệu(lưu trữ nháp).
  const handleSaveDraft = () => {
    const { mainPlayers, subPlayers, ...draftToSave } = draft;
    void mainPlayers;
    void subPlayers;
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
    setDraftMessage("Đã lưu nháp hồ sơ đăng ký .");
  };

  // Xử lý registration draft(sau khi nộp đơn thành công -> xóa bản nháp ->đưa về form mặc định).
  const resetRegistrationDraft = () => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft((prev) => ({
      ...defaultDraft,
      team: {
        ...defaultDraft.team,
        id: currentClubId ?? prev.team.id,
        name: prev.team.name || defaultDraft.team.name,
      },
      stadium: {
        ...defaultDraft.stadium,
        clubName: prev.team.name || defaultDraft.stadium.clubName,
      },
    }));
    setStep(1);
    setDraftMessage("Đã gửi hồ sơ thành công.");
  };

  // Cập nhật thông tin sân trong bản nháp.
  const handleStadiumChange = useCallback((stadium: StadiumDraft) => {
    setDraft((prev) => ({
      ...prev,
      stadium,
    }));
  }, []);

  return (
    <AppLayout>
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mb-2 font-['Be_Vietnam_Pro'] text-4xl font-black tracking-tight text-gray-900">
            Hồ sơ đăng ký giải đấu
          </h2>
          {step > 1 && selectedSeasonLabel && (
            <p className="text-sm text-gray-500">
              Đăng ký thi đấu cho giải{" "}
              <span className="font-bold text-[#0d631b]">
                {selectedSeasonLabel}
              </span>
              .
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="self-start rounded-full border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-white md:self-auto"
        >
          Lưu nháp
        </button>
      </header>

      {draftMessage && (
        <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {draftMessage}
        </div>
      )}

      <div className="mb-8 flex items-center justify-between overflow-x-auto rounded-2xl border border-gray-200 bg-[#f5f3ef] p-6">
        {steps.map((s) => {
          const isActive = step === s.step;
          const isDone = Boolean(completedSteps[s.step]);
          const isAllowed = canNavigateTab && s.step <= highestAllowedStep;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => goToStep(s.step)}
              disabled={!isAllowed}
              className={`flex min-w-[160px] flex-1 items-center gap-4 text-left ${
                isAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                  isDone || isActive
                    ? "bg-[#0d631b] text-white shadow-lg"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                ) : (
                  s.step
                )}
              </div>

              <div>
                <p className="text-sm font-bold leading-none text-gray-900">
                  {s.label}
                </p>
                <p
                  className={`mt-1 text-[11px] font-bold ${
                    isActive
                      ? "text-[#0d631b]"
                      : isDone
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {isActive
                    ? "Đang thực hiện"
                    : isDone
                      ? "Hoàn thành"
                      : isAllowed
                        ? "Có thể thực hiện"
                        : canNavigateTab
                          ? "Bị khóa"
                          : "Đang tải"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <RegistrationPortal
          setStep={goToStep}
          selectedSeason={draft.season}
          onSeasonSelected={(season) =>
            setDraft((prev) => ({
              ...prev,
              season,
            }))
          }
        />
      )}
      {step === 2 && (
        <CoachRegistration
          setStep={goToStep}
          rule={rule}
          selectedCoaches={draft.coaches}
          onCoachesChange={(coaches) =>
            setDraft((prev) => ({
              ...prev,
              coaches,
            }))
          }
        />
      )}
      {step === 3 && (
        <PlayerRegistration
          setStep={goToStep}
          rule={rule}
          players={draft.players}
          onPlayersChange={(players) =>
            setDraft((prev) => ({
              ...prev,
              players,
              mainPlayers: [],
              subPlayers: [],
            }))
          }
        />
      )}
      {step === 4 && (
        <StadiumRegistration
          setStep={goToStep}
          stadium={draft.stadium}
          onStadiumChange={handleStadiumChange}
        />
      )}
      {step === 5 && (
        <FinalConfirmation
          setStep={goToStep}
          draft={draft}
          rule={rule}
          onSubmitted={resetRegistrationDraft}
          onTeamChange={(team) =>
            setDraft((prev) => ({
              ...prev,
              team: {
                ...prev.team,
                ...team,
              },
            }))
          }
        />
      )}
    </AppLayout>
  );
};

export default RegisterFormMatch;
