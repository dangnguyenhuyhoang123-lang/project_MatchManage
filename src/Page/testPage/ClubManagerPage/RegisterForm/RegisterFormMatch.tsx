import React, { useState } from "react";
import type { GrassType } from "../../../../model/Registration";
import { AppLayout } from "../../../../layouts/AppLayout";
import CoachRegistration from "./CoachRegistration";
import FinalConfirmation from "./FinalConfirmation";
import PlayerRegistration from "./PlayerRegistration";
import RegistrationPortal from "./RegistrationPortal";
import StadiumRegistration from "./StadiumRegistration";

export type SelectedSeason = {
  id: number;
  name?: string;
  year?: string;
  leagueName?: string;
  startDate?: string;
  endDate?: string;
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
};

export type RegistrationDraft = {
  season: SelectedSeason | null;
  team: {
    id: number;
    name: string;
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
  },
};

const RegisterFormMatch: React.FC = () => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(defaultDraft);

  const steps = [
    { step: 1, label: "Chọn Giải đấu" },
    { step: 2, label: "Danh sách Ban Huấn Luyện" },
    { step: 3, label: "Danh sách Cầu thủ" },
    { step: 4, label: "Sân vận động" },
    { step: 5, label: "Kiểm tra & Xác nhận" },
  ];

  const selectedSeasonLabel =
    draft.season?.name || draft.season?.year || draft.season?.leagueName;

  return (
    <AppLayout>
      <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2 font-['Be_Vietnam_Pro']">
            Hồ sơ Đăng ký Giải đấu
          </h2>
          {step > 1 && selectedSeasonLabel && (
            <p className="text-gray-500 text-sm">
              Đăng ký thi đấu cho giải{" "}
              <span className="font-bold text-[#0d631b]">
                {selectedSeasonLabel}
              </span>
              .
            </p>
          )}
        </div>

        <button className="self-start md:self-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-white transition-all text-sm">
          Lưu nháp
        </button>
      </header>

      <div className="flex items-center justify-between bg-[#f5f3ef] p-6 rounded-2xl mb-8 border border-gray-200 overflow-x-auto">
        {steps.map((s) => {
          const isActive = step === s.step;
          const isDone = step > s.step;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setStep(s.step)}
              className="flex items-center gap-4 flex-1 min-w-[160px] text-left"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
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
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {s.label}
                </p>
                <p
                  className={`text-[11px] mt-1 font-bold ${
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
                      : "Chưa bắt đầu"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <RegistrationPortal
          setStep={setStep}
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
          setStep={setStep}
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
          setStep={setStep}
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
          setStep={setStep}
          stadium={draft.stadium}
          onStadiumChange={(stadium) =>
            setDraft((prev) => ({
              ...prev,
              stadium,
            }))
          }
        />
      )}
      {step === 5 && <FinalConfirmation setStep={setStep} draft={draft} />}
    </AppLayout>
  );
};

export default RegisterFormMatch;
