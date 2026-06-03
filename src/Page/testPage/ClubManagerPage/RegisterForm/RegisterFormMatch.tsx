import React, { useMemo, useState, useEffect } from "react";
import type { GrassType } from "../../../../model/Registration";
import { AppLayout } from "../../../../layouts/AppLayout";
import CoachRegistration from "./CoachRegistration";
import FinalConfirmation from "./FinalConfirmation";
import PlayerRegistration from "./PlayerRegistration";
import RegistrationPortal from "./RegistrationPortal";
import StadiumRegistration from "./StadiumRegistration";
import SystemRuleService from "../../../../services/SystemRuleService";
import TeamService from "../../../../services/TeamService";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";

export type SelectedSeason = {
  id: number;
  name?: string;
  year?: string;
  leagueName?: string;
  startDate?: string;
  endDate?: string;
  systemRuleId?: number;
};

export type SelectedCoach = {
  assignmentId?: number;
  coachId?: number;
  name: string;
  role: string;
  idCode?: string;
  nationality?: string;
  avatar?: string;
  status: string;
  assignedDate?: string;
};

export type SelectedPlayer = {
  id: number;
  name: string;
  position?: string;
  shirtNumber?: number;
  number?: number;
  avatar?: string | null;
  dateOfBirth?: string;
};

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
  mainPlayers: SelectedPlayer[];
  subPlayers: SelectedPlayer[];
  stadium: StadiumDraft;
};

const defaultDraft: RegistrationDraft = {
  season: null,
  team: {
    id: 1,
    name: "Becamex Bình Dương",
  },
  coaches: [],
  mainPlayers: [],
  subPlayers: [],
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

const steps = [
  { step: 1, label: "Chọn giải đấu" },
  { step: 2, label: "Danh sách ban huấn luyện" },
  { step: 3, label: "Danh sách cầu thủ" },
  { step: 4, label: "Sân vận động" },
  { step: 5, label: "Kiểm tra & xác nhận" },
];

function readSavedDraft(): RegistrationDraft {
  if (typeof window === "undefined") return defaultDraft;

  const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!rawDraft) return defaultDraft;

  try {
    const savedDraft = JSON.parse(rawDraft) as Partial<RegistrationDraft>;

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
      mainPlayers: savedDraft.mainPlayers ?? defaultDraft.mainPlayers,
      subPlayers: savedDraft.subPlayers ?? defaultDraft.subPlayers,
    };
  } catch {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return defaultDraft;
  }
}

function normalizeRoleText(role?: string) {
  return (role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

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

function getCompletedSteps(draft: RegistrationDraft): Record<number, boolean> {
  const coachRoleCounts = draft.coaches.reduce<Record<string, number>>(
    (counts, coach) => {
      const roleKey = getCoachRoleKey(coach.role);
      counts[roleKey] = (counts[roleKey] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const totalPlayers = draft.mainPlayers.length + draft.subPlayers.length;

  return {
    1: Boolean(draft.season?.id),
    2:
      draft.coaches.length >= 3 &&
      (coachRoleCounts.headCoach ?? 0) >= 1 &&
      (coachRoleCounts.assistant ?? 0) >= 1 &&
      (coachRoleCounts.doctor ?? 0) >= 1,
    3: totalPlayers >= 14,
    4:
      Boolean(draft.stadium.name.trim()) &&
      Boolean(draft.stadium.address.trim()) &&
      Number(draft.stadium.capacity) >= 10000 &&
      Number(draft.stadium.fifaStarRating) >= 2,
    5: false,
  };
}

function getHighestAllowedStep(completedSteps: Record<number, boolean>) {
  for (let currentStep = 1; currentStep <= 4; currentStep += 1) {
    if (!completedSteps[currentStep]) {
      return currentStep;
    }
  }

  return 5;
}

const RegisterFormMatch: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(() => readSavedDraft());
  const [draftMessage, setDraftMessage] = useState("");
  const [rule, setRule] = useState<any | null>(null);

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
  const completedSteps = useMemo(() => getCompletedSteps(draft), [draft]);
  const highestAllowedStep = useMemo(
    () => getHighestAllowedStep(completedSteps),
    [completedSteps],
  );

  const goToStep = (nextStep: number) => {
    if (nextStep > highestAllowedStep) {
      setDraftMessage(
        `Vui lòng hoàn thành bước ${highestAllowedStep} trước khi chuyển tiếp.`,
      );
      return;
    }

    setDraftMessage("");
    setStep(nextStep);
  };

  const handleSaveDraft = () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftMessage("Đã lưu nháp hồ sơ đăng ký trên trình duyệt.");
  };

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
    setDraftMessage(
      "Đã gửi hồ sơ thành công. Hệ thống đã xóa bản nháp và đặt lại form đăng ký về trạng thái ban đầu.",
    );
  };

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
          const isAllowed = s.step <= highestAllowedStep;

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
                        : "Bị khóa"}
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
          mainPlayers={draft.mainPlayers}
          subPlayers={draft.subPlayers}
          onPlayersChange={(mainPlayers, subPlayers) =>
            setDraft((prev) => ({
              ...prev,
              mainPlayers,
              subPlayers,
            }))
          }
        />
      )}
      {step === 4 && (
        <StadiumRegistration
          setStep={goToStep}
          stadium={draft.stadium}
          onStadiumChange={(stadium) =>
            setDraft((prev) => ({
              ...prev,
              stadium,
            }))
          }
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
