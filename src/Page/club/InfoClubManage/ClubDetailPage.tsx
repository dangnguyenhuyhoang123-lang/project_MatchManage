import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../../../layouts/AppLayout";
import TeamService from "../../../services/TeamService";
import StadiumService from "../../../services/StadiumService";
import PlayerSeasonService from "../../../services/PlayerSeasonService";
import SeasonTeamCoachService from "../../../services/SeasonTeamCoachService";
import ConfirmModal from "../../../components/ConfirmModal";
import type { TeamModel } from "../../../model/TeamModel";
import {
  CURRENT_TEAM_SEASON_ID,
  extractList,
  fallbackClubLogo,
  formatNumber,
  getStadiumAddress,
  getStadiumName,
  statusLabel,
  useCurrentClubId,
} from "./clubInfoHelpers";
import { getErrorMessage } from "../../../utils/errorUtils";

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

interface ClubFormState {
  name: string;
  logo: string;
  establishedYear: string;
  city: string;
  region: string;
  owner: string;
  description: string;
}

type ClubFormErrors = Partial<Record<keyof ClubFormState, string>>;

// Tạo dữ liệu club form.
function buildClubForm(team: TeamModel | null): ClubFormState {
  return {
    name: team?.name ?? "",
    logo: team?.logo ?? "",
    establishedYear: team?.establishedYear ? String(team.establishedYear) : "",
    city: team?.city ?? "",
    region: team?.region ?? "",
    owner: team?.owner ?? "",
    description: team?.description ?? "",
  };
}

const emptyClubForm = buildClubForm(null);

const ClubDetailPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [overview, setOverview] = useState<ClubOverview>(initialOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingClub, setSavingClub] = useState(false);
  const [clubForm, setClubForm] = useState<ClubFormState>(emptyClubForm);
  const [clubFormErrors, setClubFormErrors] = useState<ClubFormErrors>({});

  useEffect(() => {
    let mounted = true;

    // Tải club info.
    const loadClubInfo = async () => {
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
        const [playersResponse, coachesResponse, stadium] = await Promise.all([
          PlayerSeasonService.getPlayerSeasonsByTeamSeason(
            CURRENT_TEAM_SEASON_ID,
          ).catch(() =>
            PlayerSeasonService.getPlayerSeasonsByTeam(currentClubId),
          ),
          SeasonTeamCoachService.getAllSeasonTeamCoaches(0, 100, {
            teamId: currentClubId,
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
          setError("Không thể tải thông tin câu lạc bộ.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadClubInfo();

    return () => {
      mounted = false;
    };
  }, [authLoading, currentClubId]);

  const team = overview.team;

  // Mở modal hoac khung thao tác.
  const openEditModal = () => {
    if (!team) {
      toast.warning("Chưa tải được thông tin câu lạc bộ.");
      return;
    }

    setClubForm(buildClubForm(team));
    setClubFormErrors({});
    setIsEditOpen(true);
  };

  // Cập nhật club form.
  const updateClubForm = (field: keyof ClubFormState, value: string) => {
    setClubForm((prev) => ({ ...prev, [field]: value }));
    setClubFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Kiểm tra dữ liệu hợp lệ.
  const validateClubForm = () => {
    const errors: ClubFormErrors = {};
    const establishedYear = Number(clubForm.establishedYear);

    if (!clubForm.name.trim()) {
      errors.name = "Tên câu lạc bộ không được để trống.";
    }

    if (
      clubForm.establishedYear &&
      (!Number.isFinite(establishedYear) || establishedYear < 1800)
    ) {
      errors.establishedYear = "Năm thành lập không hợp lệ.";
    }

    setClubFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý lưu dữ liệu.
  const handleSaveClub = async () => {
    if (!team?.id) {
      toast.error("Không xác định được câu lạc bộ cần cập nhật.");
      return;
    }

    if (!validateClubForm()) return;

    try {
      setSavingClub(true);

      const updatedTeam = {
        ...team,
        name: clubForm.name.trim(),
        logo: clubForm.logo.trim() || null,
        establishedYear: Number(clubForm.establishedYear) || 0,
        city: clubForm.city.trim(),
        region: clubForm.region.trim(),
        owner: clubForm.owner.trim(),
        description: clubForm.description.trim(),
      } as TeamModel;

      await TeamService.updateTeam(team.id, updatedTeam);
      setOverview((prev) => ({ ...prev, team: updatedTeam }));
      setIsEditOpen(false);
      toast.success("Cập nhật thông tin câu lạc bộ thành công.");
    } catch (err) {
      console.error("Cannot update club info", err);
      toast.error(
        getErrorMessage(err, "Không thể cập nhật thông tin câu lạc bộ."),
      );
    } finally {
      setSavingClub(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 font-['Be_Vietnam_Pro']">
        <PageHeader team={team} loading={loading} onEdit={openEditModal} />

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

        <EditClubModal
          open={isEditOpen}
          form={clubForm}
          errors={clubFormErrors}
          loading={savingClub}
          onChange={updateClubForm}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleSaveClub}
        />
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

// Hiển thị PageHeader.
function PageHeader({
  team,
  loading,
  onEdit,
}: {
  team: TeamModel | null;
  loading: boolean;
  onEdit: () => void;
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
        onClick={onEdit}
        disabled={loading || !team}
        className="flex items-center gap-2 rounded-full bg-[#008C2F] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#0d631b] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-sm">edit</span>
        Cập nhật thông tin
      </button>
    </section>
  );
}

// Hiển thị ClubIdentityCard.
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

// Hiển thị MiniInfoCard.
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

// Hiển thị ContactDetailsCard.
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

// Hiển thị StatsOverview.
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

// Hiển thị ClubHistoryCard.
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

// Hiển thị SeasonInfoCard.
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

// Hiển thị EditClubModal.
function EditClubModal({
  open,
  form,
  errors,
  loading,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: ClubFormState;
  errors: ClubFormErrors;
  loading: boolean;
  onChange: (field: keyof ClubFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  // Xử lý logo file change.
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn file hình ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ảnh không nên vượt quá 2MB để tránh dữ liệu lưu quá lớn.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange("logo", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <ConfirmModal
      open={open}
      title="Cập nhật thông tin câu lạc bộ"
      message="Chỉnh sửa các thông tin cơ bản của câu lạc bộ. Logo có thể nhập bằng URL ảnh để hệ thống hiển thị ngay trên hồ sơ."
      confirmText="Lưu cập nhật"
      cancelText="Hủy"
      loading={loading}
      onClose={onClose}
      onConfirm={onSubmit}
    >
      <div className="mt-5 grid max-h-[65vh] gap-4 overflow-y-auto pr-1 text-left sm:grid-cols-2">
        <ClubTextField
          label="Tên câu lạc bộ"
          value={form.name}
          error={errors.name}
          onChange={(value) => onChange("name", value)}
          required
        />
        <ClubTextField
          label="Năm thành lập"
          value={form.establishedYear}
          error={errors.establishedYear}
          onChange={(value) => onChange("establishedYear", value)}
          type="number"
        />
        <ClubTextField
          label="Thành phố"
          value={form.city}
          error={errors.city}
          onChange={(value) => onChange("city", value)}
        />
        <ClubTextField
          label="Khu vực"
          value={form.region}
          error={errors.region}
          onChange={(value) => onChange("region", value)}
        />
        <ClubTextField
          label="Cơ quan chủ quản"
          value={form.owner}
          error={errors.owner}
          onChange={(value) => onChange("owner", value)}
          className="sm:col-span-2"
        />
        <ClubTextField
          label="URL logo"
          value={form.logo}
          error={errors.logo}
          onChange={(value) => onChange("logo", value)}
          className="sm:col-span-2"
        />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#008C2F]/30 bg-[#008C2F]/5 px-4 py-3 text-sm font-black text-[#008C2F] transition hover:bg-[#008C2F]/10 sm:col-span-2">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Chọn file logo từ máy
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            className="hidden"
          />
        </label>

        {form.logo && (
          <div className="rounded-2xl border border-gray-100 bg-[#f5f3ef] p-4 sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              Xem trước logo
            </p>
            <img
              src={form.logo}
              alt="Logo preview"
              className="h-20 w-20 rounded-full bg-white object-contain p-2"
            />
          </div>
        )}

        <ClubTextAreaField
          label="Mô tả câu lạc bộ"
          value={form.description}
          error={errors.description}
          onChange={(value) => onChange("description", value)}
          className="sm:col-span-2"
        />
      </div>
    </ConfirmModal>
  );
}

// Hiển thị ClubTextField.
function ClubTextField({
  label,
  value,
  error,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#008C2F] focus:ring-4 focus:ring-[#008C2F]/10 ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      )}
    </label>
  );
}

// Hiển thị ClubTextAreaField.
function ClubTextAreaField({
  label,
  value,
  error,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-gray-800">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#008C2F] focus:ring-4 focus:ring-[#008C2F]/10 ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      )}
    </label>
  );
}
