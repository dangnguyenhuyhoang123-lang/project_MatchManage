import React, { useEffect, useState } from "react";
import { AppLayout } from "../../../../components/AppLayout";
import TeamService from "../../../../services/TeamService";
import StadiumService from "../../../../services/StadiumService";
import PlayerSeasonService from "../../../../services/PlayerSeasonService";
import SeasonTeamCoachService from "../../../../services/SeasonTeamCoachService";
import type { TeamModel } from "../../../../model/TeamModel";
import {
  CURRENT_CLUB_ID,
  CURRENT_TEAM_SEASON_ID,
  extractList,
  fallbackClubLogo,
  formatNumber,
  getStadiumAddress,
  getStadiumName,
  statusLabel,
} from "./clubInfoHelpers";

interface ClubOverview {
  team: TeamModel | null;
  stadium: any | null;
  playerCount: number;
  staffCount: number;
  seasonName: string;
}

const initialOverview: ClubOverview = {
  team: null,
  stadium: null,
  playerCount: 0,
  staffCount: 0,
  seasonName: "Chưa cập nhật",
};

const ClubDetailPage: React.FC = () => {
  const [overview, setOverview] = useState<ClubOverview>(initialOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadClubInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const team = await TeamService.getTeamById(CURRENT_CLUB_ID);
        const [playersResponse, coachesResponse, stadium] = await Promise.all([
          PlayerSeasonService.getPlayerSeasonsByTeamSeason(
            CURRENT_TEAM_SEASON_ID,
          ).catch(() => PlayerSeasonService.getPlayerSeasonsByTeam(CURRENT_CLUB_ID)),
          SeasonTeamCoachService.getAllSeasonTeamCoaches(0, 100, {
            teamId: CURRENT_CLUB_ID,
          }),
          loadStadium(team),
        ]);

        if (!mounted) return;

        const players = extractList(playersResponse.data);
        const coaches = extractList(coachesResponse.data);

        setOverview({
          team,
          stadium,
          playerCount: players.length,
          staffCount: coaches.length,
          seasonName:
            players[0]?.seasonName ??
            coaches[0]?.seasonName ??
            "Mùa giải hiện tại",
        });
      } catch (err) {
        console.error("Cannot load club info", err);
        if (mounted) {
          setError("Không thể tải thông tin câu lạc bộ từ API.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadClubInfo();

    return () => {
      mounted = false;
    };
  }, []);

  const team = overview.team;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 font-['Be_Vietnam_Pro']">
        <PageHeader team={team} loading={loading} />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="space-y-6 lg:col-span-4">
            <ClubIdentityCard team={team} loading={loading} />
            <ContactDetailsCard team={team} stadium={overview.stadium} />
          </section>

          <section className="space-y-6 lg:col-span-8">
            <StatsOverview overview={overview} loading={loading} />
            <ClubHistoryCard team={team} />
            <SeasonInfoCard overview={overview} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClubDetailPage;

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
    <section className="flex flex-col items-start justify-between gap-6 pb-2 md:flex-row md:items-end">
      <div>
        <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#008C2F]">
          <span className="material-symbols-outlined text-sm">shield</span>
          Quản lý thông tin câu lạc bộ
        </p>

        <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
          {loading ? "Đang tải..." : team?.name || "Câu lạc bộ"}
        </h1>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#008C2F] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#0d631b] active:scale-95"
      >
        <span className="material-symbols-outlined text-sm">edit</span>
        Cập nhật thông tin
      </button>
    </section>
  );
}

function ClubIdentityCard({
  team,
  loading,
}: {
  team: TeamModel | null;
  loading: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#008C2F]/10 blur-3xl" />

      <div className="relative z-10 mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-[#f5f3ef] p-4 shadow-inner">
        <img
          src={team?.logo || fallbackClubLogo}
          alt={team?.name || "Club logo"}
          className="h-full w-full object-contain"
        />
      </div>

      <h2 className="relative z-10 text-2xl font-black text-gray-950">
        {loading ? "Đang tải..." : team?.name || "Chưa cập nhật"}
      </h2>

      <p className="relative z-10 mt-1 text-sm font-semibold text-gray-500">
        {team?.city || team?.region || "Chưa cập nhật khu vực"}
      </p>

      <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
        <MiniInfoCard
          label="Thành lập"
          value={team?.establishedYear ? String(team.establishedYear) : "N/A"}
          valueClassName="text-[#008C2F]"
        />
        <MiniInfoCard
          label="Trạng thái"
          value={statusLabel(team?.status)}
          valueClassName="text-indigo-600"
        />
      </div>
    </div>
  );
}

function MiniInfoCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#efeeea] p-4 text-center">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`text-lg font-black ${valueClassName ?? "text-gray-950"}`}>
        {value}
      </p>
    </div>
  );
}

function ContactDetailsCard({
  team,
  stadium,
}: {
  team: TeamModel | null;
  stadium: any | null;
}) {
  const items = [
    {
      icon: "stadium",
      title: getStadiumName(stadium, team?.stadiumName),
      subtitle: getStadiumAddress(stadium),
    },
    {
      icon: "location_city",
      title: team?.city || "Chưa cập nhật thành phố",
      subtitle: team?.region || "Chưa cập nhật khu vực",
    },
    {
      icon: "supervisor_account",
      title: team?.owner || "Chưa cập nhật chủ quản",
      subtitle: "Đơn vị quản lý câu lạc bộ",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-[#f5f3ef] p-6">
      <h3 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-black text-gray-950">
        <span className="material-symbols-outlined text-[#008C2F]">
          contact_mail
        </span>
        Thông tin liên hệ
      </h3>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.icon} className="group flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-sm text-gray-500 transition group-hover:text-[#008C2F]">
              {item.icon}
            </span>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {item.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsOverview({
  overview,
  loading,
}: {
  overview: ClubOverview;
  loading: boolean;
}) {
  const stats = [
    {
      label: "Cầu thủ đăng ký",
      value: loading ? "..." : String(overview.playerCount),
      icon: "groups",
    },
    {
      label: "Ban huấn luyện",
      value: loading ? "..." : String(overview.staffCount),
      icon: "sports",
    },
    {
      label: "Sức chứa sân",
      value: loading ? "..." : formatNumber(overview.stadium?.capacity),
      icon: "stadium",
      success: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm ${
            stat.success
              ? "border-[#008C2F]/10 bg-[#008C2F]/5"
              : "border-gray-100 bg-white"
          }`}
        >
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 z-0 text-6xl text-gray-100">
            {stat.icon}
          </span>

          <p
            className={`relative z-10 text-sm font-semibold ${
              stat.success ? "text-[#008C2F]" : "text-indigo-600"
            }`}
          >
            {stat.label}
          </p>

          <p className="relative z-10 text-3xl font-black text-gray-950">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ClubHistoryCard({ team }: { team: TeamModel | null }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-gray-950">
          Tổng quan câu lạc bộ
        </h2>
      </div>

      <div className="space-y-4 text-sm leading-7 text-gray-600">
        <p>
          {team?.description ||
            "Câu lạc bộ chưa cập nhật mô tả chi tiết. Thông tin này sẽ được hiển thị sau khi quản lý câu lạc bộ hoàn thiện hồ sơ."}
        </p>
      </div>
    </article>
  );
}

function SeasonInfoCard({ overview }: { overview: ClubOverview }) {
  const rows = [
    {
      icon: "event",
      title: overview.seasonName,
      subtitle: "Mùa giải đang được đồng bộ từ dữ liệu đăng ký",
      value: "Hiện tại",
    },
    {
      icon: "groups",
      title: `${overview.playerCount} cầu thủ`,
      subtitle: "Danh sách cầu thủ đã đăng ký thi đấu",
      value: "PlayerSeason",
    },
    {
      icon: "sports",
      title: `${overview.staffCount} thành viên`,
      subtitle: "Ban huấn luyện thuộc biên chế câu lạc bộ",
      value: "Staff",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-[#fbf9f5] p-6 md:p-8">
      <h2 className="mb-6 text-xl font-black text-gray-950">
        Dữ liệu vận hành
      </h2>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.icon}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:bg-[#efeeea]"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008C2F]/10 text-[#008C2F]">
                <span className="material-symbols-outlined text-xl">
                  {row.icon}
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-gray-950">{row.title}</p>
                <p className="text-xs font-medium text-gray-500">
                  {row.subtitle}
                </p>
              </div>
            </div>

            <p className="shrink-0 text-xs font-black uppercase tracking-wide text-indigo-600">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
