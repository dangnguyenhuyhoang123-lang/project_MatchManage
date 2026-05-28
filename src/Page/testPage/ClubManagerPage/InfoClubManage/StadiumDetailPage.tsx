import React, { useEffect, useState } from "react";
import { AppLayout } from "../../../../layouts/AppLayout";
import TeamService from "../../../../services/TeamService";
import StadiumService from "../../../../services/StadiumService";
import type { TeamModel } from "../../../../model/TeamModel";
import {
  extractList,
  fallbackStadiumImage,
  formatNumber,
  getStadiumAddress,
  getStadiumName,
  useCurrentClubId,
} from "./clubInfoHelpers";

interface StadiumState {
  team: TeamModel | null;
  stadium: any | null;
}

const StadiumDetailPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [state, setState] = useState<StadiumState>({
    team: null,
    stadium: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStadiumInfo = async () => {
      if (authLoading) return;

      if (!currentClubId) {
        setLoading(false);
        setError(
          "Không xác định được câu lạc bộ của người dùng đang đăng nhập.",
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const team = await TeamService.getTeamById(currentClubId);
        const stadium = await loadStadium(team);

        if (mounted) {
          setState({ team, stadium });
        }
      } catch (err) {
        console.error("Cannot load stadium info", err);
        if (mounted) {
          setError("Không thể tải thông tin sân vận động từ API.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStadiumInfo();

    return () => {
      mounted = false;
    };
  }, [authLoading, currentClubId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-10 font-['Be_Vietnam_Pro']">
        <PageHeader team={state.team} loading={loading} />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <StadiumHeroCard
          team={state.team}
          stadium={state.stadium}
          loading={loading}
        />

        <FacilitiesSection stadium={state.stadium} />
      </div>
    </AppLayout>
  );
};

export default StadiumDetailPage;

async function loadStadium(team: TeamModel) {
  if (team.stadiumId) {
    const response = await StadiumService.getStadiumById(team.stadiumId);
    return response.data;
  }

  if (team.stadiumName) {
    const response = await StadiumService.getAllStadiums(team.stadiumName);
    return extractList(response.data)[0] ?? null;
  }

  return null;
}

function PageHeader({
  team,
  loading,
}: {
  team: TeamModel | null;
  loading: boolean;
}) {
  return (
    <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#008C2F]">
          <span className="material-symbols-outlined text-sm">business</span>
          <span>Quản lý câu lạc bộ</span>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <span className="text-gray-900">Sân vận động</span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
          {loading ? "Đang tải sân nhà..." : "Thông tin Sân nhà"}
        </h1>
        <p className="text-sm font-semibold text-gray-500">
          {team?.name || ""}
        </p>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#008C2F] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#0d631b] active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
        Chỉnh sửa
      </button>
    </section>
  );
}

function StadiumHeroCard({
  team,
  stadium,
  loading,
}: {
  team: TeamModel | null;
  stadium: any | null;
  loading: boolean;
}) {
  const stadiumName = getStadiumName(stadium, team?.stadiumName);
  const image =
    stadium?.image ??
    stadium?.imageUrl ??
    stadium?.avatar ??
    stadium?.photo ??
    fallbackStadiumImage;

  return (
    <section className="group relative flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_12px_48px_rgba(27,28,26,0.06)] lg:flex-row lg:rounded-[2.5rem] lg:p-6">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] lg:min-h-[400px] lg:w-7/12 lg:rounded-[2rem]">
        <img
          src={image}
          alt={stadiumName}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/30 bg-white/85 px-4 py-2 shadow-sm backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-[#008C2F]" />
          <span className="text-xs font-black uppercase tracking-wide text-gray-700">
            Dữ liệu sân thuộc CLB
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center space-y-8 py-4 lg:w-5/12 lg:py-8 lg:pr-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-gray-950 lg:text-5xl">
            {loading ? "Đang tải..." : stadiumName}
          </h2>

          <div className="flex items-start gap-3 text-gray-600">
            <span className="material-symbols-outlined mt-0.5 text-[#008C2F]">
              location_on
            </span>

            <p className="text-sm leading-7">{getStadiumAddress(stadium)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2">
          <MetricBlock
            label="Sức chứa"
            value={formatNumber(stadium?.capacity)}
            suffix={Number(stadium?.capacity) > 0 ? "chỗ" : ""}
          />

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Loại mặt cỏ
            </span>

            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008C2F] text-white">
                <span className="material-symbols-outlined text-[18px]">
                  grass
                </span>
              </div>

              <span className="text-sm font-black text-gray-900">
                {stadium?.grassType ?? stadium?.surfaceType ?? "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm leading-7 text-gray-600">
            {stadium?.description ||
              "Thông tin mô tả sân vận động chưa được cập nhật trong hệ thống."}
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricBlock({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        {label}
      </span>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black tracking-tight text-[#008C2F]">
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-semibold text-gray-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function FacilitiesSection({ stadium }: { stadium: any | null }) {
  const facilities = [
    {
      icon: "location_on",
      title: "Địa chỉ",
      description: getStadiumAddress(stadium),
      variant: "primary",
    },
    {
      icon: "groups",
      title: "Khán đài",
      description: `Sức chứa ${formatNumber(stadium?.capacity)} khán giả.`,
      variant: "secondary",
    },
    {
      icon: "grass",
      title: "Mặt sân",
      description:
        stadium?.grassType ??
        stadium?.surfaceType ??
        "Chưa cập nhật loại mặt cỏ.",
      variant: "tertiary",
    },
    {
      icon: "verified",
      title: "Trạng thái",
      description: stadium?.status ?? "Đang sử dụng",
      variant: "neutral",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-950">Thông tin hạ tầng</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {facilities.map((facility) => (
          <FacilityCard key={facility.title} facility={facility} />
        ))}
      </div>
    </section>
  );
}

function FacilityCard({
  facility,
}: {
  facility: {
    icon: string;
    title: string;
    description: string;
    variant: string;
  };
}) {
  const variantClass: Record<string, string> = {
    secondary: "bg-indigo-100 text-indigo-700",
    tertiary: "bg-[#008C2F] text-white",
    neutral: "bg-[#e4e2de] text-gray-700 ring-1 ring-gray-200",
    primary: "bg-[#0d631b] text-white",
  };

  return (
    <article className="group flex cursor-default flex-col items-start gap-4 rounded-[2rem] bg-[#f5f3ef] p-6 transition hover:bg-[#e4e2de]">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full transition group-hover:scale-110 ${
          variantClass[facility.variant]
        }`}
      >
        <span className="material-symbols-outlined text-[28px]">
          {facility.icon}
        </span>
      </div>

      <div>
        <h3 className="mb-1 text-base font-black text-gray-950">
          {facility.title}
        </h3>

        <p className="text-sm leading-6 text-gray-600">
          {facility.description}
        </p>
      </div>
    </article>
  );
}
