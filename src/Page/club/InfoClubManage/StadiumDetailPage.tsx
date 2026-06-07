import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../../../layouts/AppLayout";
import TeamService from "../../../services/TeamService";
import StadiumService from "../../../services/StadiumService";
import type { TeamModel } from "../../../model/TeamModel";
import ConfirmModal from "../../../components/ConfirmModal";
import {
  extractList,
  fallbackStadiumImage,
  formatNumber,
  getStadiumAddress,
  getStadiumName,
  useCurrentClubId,
} from "./clubInfoHelpers";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";
import { getErrorMessage } from "../../../utils/errorUtils";

interface StadiumState {
  team: TeamModel | null;
  stadium: any | null;
}

interface StadiumFormState {
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: string;
  grassType: string;
  fifaStarRating: string;
  imageUrl: string;
  description: string;
  status: string;
}

type StadiumFormErrors = Partial<Record<keyof StadiumFormState, string>>;

// Tạo dữ liệu stadium form.
function buildStadiumForm(
  stadium: any | null,
  team: TeamModel | null,
): StadiumFormState {
  const stadiumName = getStadiumName(stadium, team?.stadiumName);

  return {
    name: stadiumName === "Chưa cập nhật sân" ? "" : stadiumName,
    address: stadium?.address ?? stadium?.location ?? "",
    city: stadium?.city ?? team?.city ?? "",
    country: stadium?.country ?? "Việt Nam",
    capacity: stadium?.capacity ? String(stadium.capacity) : "",
    grassType: stadium?.grassType ?? stadium?.surfaceType ?? "natural",
    fifaStarRating: stadium?.fifaStarRating
      ? String(stadium.fifaStarRating)
      : "2",
    imageUrl:
      stadium?.imageUrl ??
      stadium?.image ??
      stadium?.avatar ??
      stadium?.photo ??
      "",
    description: stadium?.description ?? "",
    status: stadium?.status ?? "ACTIVE",
  };
}

const emptyStadiumForm = buildStadiumForm(null, null);

const StadiumDetailPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [state, setState] = useState<StadiumState>({
    team: null,
    stadium: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingStadium, setSavingStadium] = useState(false);
  const [stadiumForm, setStadiumForm] =
    useState<StadiumFormState>(emptyStadiumForm);
  const [stadiumFormErrors, setStadiumFormErrors] = useState<StadiumFormErrors>(
    {},
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    // Tải stadium info.
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
          setError("Không thể tải thông tin sân vận động.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStadiumInfo();

    return () => {
      mounted = false;
    };
  }, [authLoading, currentClubId, reloadKey]);

  const handleRealtimeEvent = useCallback((event: RealtimeEventDTO) => {
    if (
      event.action === "REFETCH_STADIUMS" ||
      event.action === "REFETCH_TEAMS"
    ) {
      setReloadKey((current) => current + 1);
    }
  }, []);

  useRealtimeEvent(handleRealtimeEvent);

  // Mở modal hoac khung thao tác.
  const openEditModal = () => {
    if (!state.team) {
      toast.warning("Chưa tải được thông tin câu lạc bộ.");
      return;
    }

    setStadiumForm(buildStadiumForm(state.stadium, state.team));
    setStadiumFormErrors({});
    setIsEditOpen(true);
  };

  // Cập nhật stadium form.
  const updateStadiumForm = (field: keyof StadiumFormState, value: string) => {
    setStadiumForm((prev) => ({ ...prev, [field]: value }));
    setStadiumFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Kiểm tra dữ liệu hợp lệ.
  const validateStadiumForm = () => {
    const errors: StadiumFormErrors = {};
    const capacity = Number(stadiumForm.capacity);
    const fifaStarRating = Number(stadiumForm.fifaStarRating);

    if (!stadiumForm.name.trim()) {
      errors.name = "Tên sân vận động không được để trống.";
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      errors.capacity = "Sức chứa phải là số lớn hơn 0.";
    }

    if (
      !Number.isFinite(fifaStarRating) ||
      fifaStarRating < 1 ||
      fifaStarRating > 5
    ) {
      errors.fifaStarRating = "Tiêu chuẩn FIFA phải từ 1 đến 5 sao.";
    }

    setStadiumFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý lưu dữ liệu.
  const handleSaveStadium = async () => {
    if (!state.team?.id) {
      toast.error("Không xác định được câu lạc bộ cần cập nhật sân nhà.");
      return;
    }

    if (!validateStadiumForm()) return;

    const payload = {
      ...state.stadium,
      name: stadiumForm.name.trim(),
      stadiumName: stadiumForm.name.trim(),
      address: stadiumForm.address.trim(),
      location: stadiumForm.address.trim(),
      city: stadiumForm.city.trim(),
      country: stadiumForm.country.trim() || "Việt Nam",
      capacity: Number(stadiumForm.capacity) || 0,
      grassType: stadiumForm.grassType,
      surfaceType: stadiumForm.grassType,
      fifaStarRating: Number(stadiumForm.fifaStarRating) || 2,
      imageUrl: stadiumForm.imageUrl.trim() || null,
      image: stadiumForm.imageUrl.trim() || null,
      description: stadiumForm.description.trim(),
      status: stadiumForm.status || "ACTIVE",
    };

    try {
      setSavingStadium(true);

      let savedStadium: any;
      if (state.stadium?.id) {
        const response = await StadiumService.updateStadium(
          state.stadium.id,
          payload,
        );
        savedStadium = response.data ?? payload;
      } else {
        const response = await StadiumService.addStadium(payload);
        savedStadium = response.data ?? payload;
      }

      const savedStadiumId =
        savedStadium?.id ?? state.stadium?.id ?? state.team.stadiumId ?? null;
      let updatedTeam = state.team;

      if (savedStadiumId && state.team.stadiumId !== savedStadiumId) {
        updatedTeam = {
          ...state.team,
          stadiumId: savedStadiumId,
          stadiumName: savedStadium?.name ?? payload.name,
        } as TeamModel;

        await TeamService.updateTeam(state.team.id, updatedTeam);
      }

      setState({ team: updatedTeam, stadium: savedStadium });
      setIsEditOpen(false);
      toast.success(
        state.stadium?.id
          ? "Cập nhật sân vận động thành công."
          : "Tạo và gán sân vận động thành công.",
      );
    } catch (err) {
      console.error("Cannot save stadium", err);
      toast.error(
        getErrorMessage(err, "Không thể lưu thông tin sân vận động."),
      );
    } finally {
      setSavingStadium(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-10 font-['Be_Vietnam_Pro']">
        <PageHeader
          team={state.team}
          loading={loading}
          onEdit={openEditModal}
        />

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

        <EditStadiumModal
          open={isEditOpen}
          form={stadiumForm}
          errors={stadiumFormErrors}
          loading={savingStadium}
          isCreate={!state.stadium?.id}
          onChange={updateStadiumForm}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleSaveStadium}
        />
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
        onClick={onEdit}
        disabled={loading || !team}
        className="flex items-center gap-2 rounded-full bg-[#008C2F] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#0d631b] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
        Chỉnh sửa
      </button>
    </section>
  );
}

// Hiển thị StadiumHeroCard.
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

// Hiển thị MetricBlock.
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

// Hiển thị FacilitiesSection.
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

// Hiển thị FacilityCard.
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

// Hiển thị EditStadiumModal.
function EditStadiumModal({
  open,
  form,
  errors,
  loading,
  isCreate,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: StadiumFormState;
  errors: StadiumFormErrors;
  loading: boolean;
  isCreate: boolean;
  onChange: (field: keyof StadiumFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const handleStadiumImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
    reader.onload = () => onChange("imageUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <ConfirmModal
      open={open}
      title={isCreate ? "Tạo sân vận động" : "Cập nhật sân vận động"}
      message="Cập nhật thông tin sân nhà của câu lạc bộ. Sức chứa và tiêu chuẩn FIFA sẽ được dùng khi kiểm tra hồ sơ đăng ký mùa giải."
      confirmText={isCreate ? "Tạo sân" : "Lưu cập nhật"}
      cancelText="Hủy"
      loading={loading}
      onClose={onClose}
      onConfirm={onSubmit}
    >
      <div className="mt-5 grid max-h-[65vh] gap-4 overflow-y-auto pr-1 text-left sm:grid-cols-2">
        <StadiumTextField
          label="Tên sân"
          value={form.name}
          error={errors.name}
          onChange={(value) => onChange("name", value)}
          required
        />
        <StadiumTextField
          label="Thành phố"
          value={form.city}
          error={errors.city}
          onChange={(value) => onChange("city", value)}
        />
        <StadiumTextField
          label="Địa chỉ"
          value={form.address}
          error={errors.address}
          onChange={(value) => onChange("address", value)}
          className="sm:col-span-2"
        />
        <StadiumTextField
          label="Quốc gia"
          value={form.country}
          error={errors.country}
          onChange={(value) => onChange("country", value)}
        />
        <StadiumTextField
          label="Sức chứa"
          value={form.capacity}
          error={errors.capacity}
          onChange={(value) => onChange("capacity", value)}
          type="number"
          required
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-gray-800">
            Loại mặt sân
          </span>
          <select
            value={form.grassType}
            onChange={(event) => onChange("grassType", event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#008C2F] focus:ring-4 focus:ring-[#008C2F]/10"
          >
            <option value="natural">Cỏ tự nhiên</option>
            <option value="artificial">Cỏ nhân tạo</option>
            <option value="hybrid">Cỏ lai</option>
          </select>
        </label>

        <StadiumTextField
          label="Tiêu chuẩn FIFA sao"
          value={form.fifaStarRating}
          error={errors.fifaStarRating}
          onChange={(value) => onChange("fifaStarRating", value)}
          type="number"
          required
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-gray-800">
            Trạng thái
          </span>
          <select
            value={form.status}
            onChange={(event) => onChange("status", event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#008C2F] focus:ring-4 focus:ring-[#008C2F]/10"
          >
            <option value="ACTIVE">Đang sử dụng</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
        </label>

        <StadiumTextField
          label="URL ảnh sân"
          value={form.imageUrl}
          error={errors.imageUrl}
          onChange={(value) => onChange("imageUrl", value)}
          className="sm:col-span-2"
        />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#008C2F]/30 bg-[#008C2F]/5 px-4 py-3 text-sm font-black text-[#008C2F] transition hover:bg-[#008C2F]/10 sm:col-span-2">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Chọn ảnh sân
          <input
            type="file"
            accept="image/*"
            onChange={handleStadiumImageFileChange}
            className="hidden"
          />
        </label>

        {form.imageUrl && (
          <div className="rounded-2xl border border-gray-100 bg-[#f5f3ef] p-4 sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              Xem trước ảnh sân
            </p>
            <img
              src={form.imageUrl}
              alt="Stadium preview"
              className="h-36 w-full rounded-2xl object-cover"
            />
          </div>
        )}

        <StadiumTextAreaField
          label="Mô tả sân"
          value={form.description}
          error={errors.description}
          onChange={(value) => onChange("description", value)}
          className="sm:col-span-2"
        />
      </div>
    </ConfirmModal>
  );
}

// Hiển thị StadiumTextField.
function StadiumTextField({
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

// Hiển thị StadiumTextAreaField.
function StadiumTextAreaField({
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
