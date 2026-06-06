import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../../../layouts/AppLayout";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { PhanTrang } from "../../../utils/PhanTrang";
import { Modal } from "../../../components/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import CoachService from "../../../services/CoachService";
import type { Coach } from "../../../model/CoachModel";
import TeamService from "../../../services/TeamService";
import {
  calculateAge,
  fallbackAvatar,
  initials,
  removeVietnameseMark,
  statusLabel,
  useCurrentClubId,
} from "./clubInfoHelpers";
import type { TeamModel } from "../../../model/TeamModel";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  nationality: string;
  license: string;
  age: string;
  image?: string | null;
  status: string;
  featured?: boolean;
  source: Coach;
}

type CoachForm = {
  id?: number;
  name: string;
  nationality: string;
  idCode: string;
  avatar: string;
  birthDay: string;
  description: string;
  status: string;
  teamId: number;
  teamName: string;
};

const PAGE_SIZE = 8;

const emptyCoach = (teamId: number | null): CoachForm => ({
  name: "",
  nationality: "Việt Nam",
  idCode: "",
  avatar: "",
  birthDay: "",
  description: "HLV trưởng",
  status: "ACTIVE",
  teamId: teamId ?? 0,
  teamName: "",
});

const ClubStaffPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState<TeamModel | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<StaffMember | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = useCallback(async () => {
    if (authLoading) return;

    if (!currentClubId) {
      setLoading(false);
      setError("Không xác định được câu lạc bộ của người dùng đang đăng nhập.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [data, dataTeam] = await Promise.all([
        CoachService.getCoachesByTeamNormalized(
          currentClubId,
          currentPage - 1,
          PAGE_SIZE,
        ),
        TeamService.getTeamById(currentClubId),
      ]);
      setTeam(dataTeam);
      setStaff(
        (data.content ?? [])
          .map(normalizeStaff)
          .filter((member: StaffMember | null): member is StaffMember =>
            Boolean(member),
          ),
      );
      setTotalPages(Number(data.totalPages ?? 1));
      setTotalElements(Number(data.totalElements ?? data.content?.length ?? 0));
    } catch (err) {
      console.error("Cannot load staff", err);
      setError("Không thể tải danh sách ban huấn luyện từ API.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, currentClubId, currentPage]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_COACHES" ||
        event.action === "REFETCH_TEAMS"
      ) {
        void loadStaff();
      }
    },
    [loadStaff],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const { coachingStaff, medicalStaff } = useMemo(() => {
    const medicalKeywords = ["BAC SI", "Y TE", "PHYSIO", "FITNESS", "MEDICAL"];
    return {
      coachingStaff: staff.filter((item) => {
        const role = removeVietnameseMark(item.role).toUpperCase();
        return !medicalKeywords.some((keyword) => role.includes(keyword));
      }),
      medicalStaff: staff.filter((item) => {
        const role = removeVietnameseMark(item.role).toUpperCase();
        return medicalKeywords.some((keyword) => role.includes(keyword));
      }),
    };
  }, [staff]);

  const openCreate = () => {
    setEditingCoach(null);
    setFormOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingCoach(member.source);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await CoachService.deleteCoach(deleteTarget.id);
      toast.success("Đã xóa huấn luyện viên khỏi biên chế.");
      setDeleteTarget(null);
      if (staff.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await loadStaff();
      }
    } catch (err) {
      console.error("Cannot hard delete coach, trying soft disable", err);
      try {
        await CoachService.updateCoach(deleteTarget.id, {
          ...deleteTarget.source,
          status: "INACTIVE",
          teamId: currentClubId ?? deleteTarget.source.teamId,
        });
        toast.warning(
          "HLV đang có dữ liệu liên quan nên không thể xóa cứng. Hệ thống đã chuyển sang trạng thái tạm ngưng.",
        );
        setDeleteTarget(null);
        await loadStaff();
      } catch (softError) {
        console.error("Cannot disable coach after delete failed", softError);
        toast.error(
          "Không thể xóa hoặc tạm ngưng HLV vì đang bị ràng buộc dữ liệu.",
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const exportStaff = () => {
    if (staff.length === 0) {
      toast.warning("Không có thành viên ban huấn luyện để xuất.");
      return;
    }
    downloadCsv(
      `danh-sach-hlv-${team?.name ?? "clb"}.csv`,
      [
        "STT",
        "Họ tên",
        "Vai trò",
        "Quốc tịch",
        "Tuổi",
        "Mã giấy tờ",
        "Trạng thái",
      ],
      staff.map((member, index) => [
        index + 1,
        member.name,
        member.role,
        member.nationality,
        member.age,
        member.license,
        member.status,
      ]),
    );
    toast.success("Đã xuất danh sách ban huấn luyện.");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-10 font-['Be_Vietnam_Pro']">
        <StaffHeader
          total={totalElements}
          team={team}
          onCreate={openCreate}
          onExport={exportStaff}
        />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <CoachingStaffGrid
          staff={coachingStaff}
          loading={loading}
          onView={setDetailTarget}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />

        <MedicalPerformanceSection
          staff={medicalStaff}
          loading={loading}
          onView={setDetailTarget}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />

        <PaginationSummary
          shown={staff.length}
          total={totalElements}
          currentPage={currentPage}
        />

        <PhanTrang
          tongSoTrang={totalPages}
          trangHienTai={currentPage}
          xuLyTrang={setCurrentPage}
        />
      </div>

      <CoachFormModal
        open={formOpen}
        currentClubId={currentClubId ?? null}
        currentCoach={editingCoach}
        existingStaff={staff}
        onClose={() => setFormOpen(false)}
        onSuccess={async () => {
          await loadStaff();
          setFormOpen(false);
        }}
      />

      <CoachDetailModal
        staff={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Xóa huấn luyện viên"
        message={`Bạn có chắc chắn muốn xóa ${deleteTarget?.name ?? "huấn luyện viên này"} khỏi biên chế? Nếu HLV đã phát sinh dữ liệu đăng ký/mùa giải, hệ thống sẽ chuyển sang tạm ngưng thay vì xóa cứng.`}
        confirmText="Xóa"
        cancelText="Hủy"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
};

export default ClubStaffPage;

function normalizeStaff(coach: Coach | any): StaffMember | null {
  const id = Number(coach?.id ?? coach?.coachId);
  if (!id) return null;
  const role =
    coach?.role ??
    coach?.position ??
    coach?.description ??
    "Thành viên ban huấn luyện";
  return {
    id,
    name: coach?.name ?? coach?.coachName ?? "Thành viên chưa cập nhật",
    role,
    nationality: coach?.nationality ?? "Việt Nam",
    license: coach?.license ?? coach?.idCode ?? "Chưa cập nhật",
    age: calculateAge(coach?.birthDay ?? coach?.birthday ?? coach?.dateOfBirth),
    image: coach?.avatar ?? coach?.image ?? null,
    status: statusLabel(coach?.status),
    featured: isHeadCoach(role),
    source: {
      id,
      name: coach?.name ?? coach?.coachName ?? "",
      nationality: coach?.nationality ?? "Việt Nam",
      idCode: coach?.idCode ?? coach?.license ?? "",
      avatar: coach?.avatar ?? coach?.image ?? "",
      birthDay: coach?.birthDay ?? coach?.birthday ?? coach?.dateOfBirth ?? "",
      description: role,
      status: coach?.status ?? "ACTIVE",
      teamId: Number(coach?.teamId ?? coach?.team?.id ?? 0),
      teamName: coach?.teamName ?? coach?.team?.name ?? "",
    },
  };
}

function isHeadCoach(role: string) {
  const normalized = removeVietnameseMark(role).toUpperCase();
  return (
    normalized.includes("HLV TRUONG") ||
    normalized.includes("HEAD") ||
    normalized.includes("TRUONG")
  );
}

function getBirthYear(date?: string) {
  if (!date) return "Chưa cập nhật";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return String(parsed.getFullYear());
}

function getAgeLabel(date?: string) {
  const age = calculateAge(date);
  return age === "N/A" || age === "Chưa cập nhật"
    ? "Chưa cập nhật"
    : `${age} tuổi`;
}

function hasAnotherHeadCoach(staff: StaffMember[], currentCoachId?: number) {
  return staff.some(
    (member) =>
      member.id !== currentCoachId &&
      member.source.status !== "INACTIVE" &&
      isHeadCoach(member.role),
  );
}

function StaffHeader({
  total,
  team,
  onCreate,
  onExport,
}: {
  total: number;
  team: TeamModel | null;
  onCreate: () => void;
  onExport: () => void;
}) {
  const teamName = team?.name ?? "câu lạc bộ";
  return (
    <section className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-3xl font-black text-gray-950">
          Ban huấn luyện
        </h1>
        <p className="max-w-xl text-base leading-7 text-gray-700">
          {total} thành viên thuộc biên chế {teamName}.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 rounded-full border border-[#008C2F]/20 bg-white px-6 py-2.5 text-sm font-semibold text-[#008C2F] transition hover:bg-green-50"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Xuất danh sách
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d631b] hover:shadow-lg hover:shadow-green-900/20"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Thêm HLV
        </button>
      </div>
    </section>
  );
}

function CoachingStaffGrid({
  staff,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  staff: StaffMember[];
  loading: boolean;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
}) {
  if (loading) {
    return (
      <LoadingSpinner
        message="Đang tải ban huấn luyện"
        description="Thông tin thành viên ban huấn luyện đang được đồng bộ từ backend."
        fullHeight
      />
    );
  }
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {staff.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-sm font-bold text-gray-500 md:col-span-2 lg:col-span-3 xl:col-span-4">
          Chưa có thành viên huấn luyện trong trang hiện tại.
        </div>
      ) : (
        staff.map((member) => (
          <StaffCard
            key={member.id}
            staff={member}
            onView={() => onView(member)}
            onEdit={() => onEdit(member)}
            onDelete={() => onDelete(member)}
          />
        ))
      )}
    </section>
  );
}

function StaffCard({
  staff,
  onView,
  onEdit,
  onDelete,
}: {
  staff: StaffMember;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-center gap-4">
        <StaffAvatar staff={staff} size="lg" />
        <div>
          <h2 className="text-lg font-black leading-tight text-gray-950">
            {staff.name}
          </h2>
          <p className="flex items-center gap-1 text-sm font-semibold text-[#008C2F]">
            {staff.featured && (
              <span className="material-symbols-outlined text-xs text-[#008C2F]">
                star
              </span>
            )}
            {staff.role}
          </p>
        </div>
      </div>
      <div className="mb-5 flex-1 space-y-3">
        <InfoRow label="Quốc tịch" value={staff.nationality} icon="public" />
        <InfoRow label="Tuổi" value={staff.age} />
        <InfoRow label="Mã giấy tờ" value={staff.license} />
        <InfoRow label="Trạng thái" value={staff.status} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ActionButton icon="visibility" label="Xem" onClick={onView} />
        <ActionButton icon="edit" label="Sửa" onClick={onEdit} />
        <ActionButton icon="delete" label="Xóa" danger onClick={onDelete} />
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-full border py-2 text-xs font-semibold transition ${danger ? "border-red-100 text-red-500 hover:bg-red-50" : "border-gray-200 text-gray-600 hover:bg-[#f5f3ef] hover:text-gray-900"}`}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );
}

function CoachFormModal({
  open,
  currentClubId,
  currentCoach,
  existingStaff,
  onClose,
  onSuccess,
}: {
  open: boolean;
  currentClubId: number | null;
  currentCoach?: Coach | null;
  existingStaff: StaffMember[];
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<CoachForm>(emptyCoach(currentClubId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(currentCoach?.id);
  const agePreview = getAgeLabel(form.birthDay);
  const birthYearPreview = getBirthYear(form.birthDay);

  useEffect(() => {
    if (!open) return;
    setForm(
      currentCoach
        ? {
            id: currentCoach.id,
            name: currentCoach.name ?? "",
            nationality: currentCoach.nationality ?? "Việt Nam",
            idCode: currentCoach.idCode ?? "",
            avatar: currentCoach.avatar ?? "",
            birthDay: currentCoach.birthDay ?? "",
            description: currentCoach.description ?? "HLV trưởng",
            status: currentCoach.status ?? "ACTIVE",
            teamId: currentClubId ?? currentCoach.teamId ?? 0,
            teamName: currentCoach.teamName ?? "",
          }
        : emptyCoach(currentClubId),
    );
    setErrors({});
  }, [currentClubId, currentCoach, open]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!currentClubId) nextErrors.teamId = "Không xác định được CLB hiện tại.";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập họ tên HLV.";
    if (!form.description.trim())
      nextErrors.description = "Vui lòng chọn vai trò.";
    if (
      isHeadCoach(form.description) &&
      hasAnotherHeadCoach(existingStaff, form.id)
    ) {
      nextErrors.description =
        "Mỗi câu lạc bộ chỉ được có 01 HLV trưởng đang hoạt động.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = { ...form, teamId: currentClubId };
      if (form.id) {
        await CoachService.updateCoach(form.id, payload);
        toast.success("Cập nhật huấn luyện viên thành công.");
      } else {
        await CoachService.addCoach(payload);
        toast.success("Thêm huấn luyện viên vào biên chế thành công.");
      }
      await onSuccess();
    } catch (err) {
      console.error("Cannot save coach", err);
      toast.error("Không thể lưu thông tin huấn luyện viên.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-950">
            {isEdit ? "Cập nhật huấn luyện viên" : "Thêm huấn luyện viên"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            HLV sẽ được gắn với câu lạc bộ đang đăng nhập.
          </p>
        </div>
        {errors.teamId && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {errors.teamId}
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            label="Họ tên"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            label="CCCD / Mã định danh"
            name="idCode"
            value={form.idCode}
            onChange={handleChange}
          />
          <div className="space-y-2">
            <InputField
              label="Ngày sinh"
              name="birthDay"
              type="date"
              value={form.birthDay}
              onChange={handleChange}
            />
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-bold text-green-700">
              {form.birthDay
                ? `Năm sinh: ${birthYearPreview} • Tuổi hiện tại: ${agePreview}`
                : "Chọn ngày sinh để hệ thống tự tính tuổi."}
            </div>
          </div>
          <InputField
            label="Quốc tịch"
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
          />
          <SelectField
            label="Vai trò"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            options={[
              "HLV trưởng",
              "Trợ lý",
              "HLV thủ môn",
              "HLV thể lực",
              "Bác sĩ",
              "Y tế",
              "Phân tích viên",
            ].map((item) => ({ value: item, label: item }))}
          />
          <SelectField
            label="Trạng thái"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "INACTIVE", label: "Tạm ngưng" },
            ]}
          />
          <InputField
            label="Avatar URL"
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#008C2F] px-8 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm HLV"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CoachDetailModal({
  staff,
  onClose,
}: {
  staff: StaffMember | null;
  onClose: () => void;
}) {
  return (
    <Modal open={staff !== null} onClose={onClose} size="md">
      {staff && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <StaffAvatar staff={staff} size="lg" />
            <div>
              <h2 className="text-2xl font-black text-gray-950">
                {staff.name}
              </h2>
              <p className="font-semibold text-[#008C2F]">{staff.role}</p>
            </div>
          </div>
          <div className="grid gap-3">
            <InfoRow
              label="Quốc tịch"
              value={staff.nationality}
              icon="public"
            />
            <InfoRow label="Tuổi" value={staff.age} />
            <InfoRow label="Mã giấy tờ" value={staff.license} />
            <InfoRow label="Trạng thái" value={staff.status} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function StaffAvatar({
  staff,
  size = "md",
}: {
  staff: StaffMember;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  if (staff.image) {
    return (
      <div
        className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-[#eae8e4]`}
      >
        <img
          src={staff.image}
          alt={staff.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eae8e4] font-black text-gray-600`}
    >
      {initials(staff.name) || (
        <img
          src={fallbackAvatar}
          alt={staff.name}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-sm bg-[#f5f3ef] px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="flex items-center gap-1 text-sm font-semibold text-gray-950">
        {icon && (
          <span className="material-symbols-outlined text-sm text-gray-500">
            {icon}
          </span>
        )}
        {value}
      </span>
    </div>
  );
}

function MedicalPerformanceSection({
  staff,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  staff: StaffMember[];
  loading: boolean;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-black text-gray-950">Y tế & thể lực</h2>
      <div className="space-y-2">
        <div className="hidden grid-cols-12 gap-4 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-gray-600 md:grid">
          <div className="col-span-4">Thành viên</div>
          <div className="col-span-3">Vai trò</div>
          <div className="col-span-2">Quốc tịch</div>
          <div className="col-span-3 text-right">Thao tác</div>
        </div>
        {loading ? (
          <LoadingSpinner
            message="Đang tải dữ liệu y tế"
            description="Nhân sự y tế và thể lực đang được tải để hiển thị đầy đủ trên trang."
            fullHeight
          />
        ) : staff.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-sm font-bold text-gray-500">
            Chưa có nhân sự y tế hoặc thể lực trong trang hiện tại.
          </div>
        ) : (
          staff.map((member) => (
            <MedicalStaffRow
              key={member.id}
              staff={member}
              onView={() => onView(member)}
              onEdit={() => onEdit(member)}
              onDelete={() => onDelete(member)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function MedicalStaffRow({
  staff,
  onView,
  onEdit,
  onDelete,
}: {
  staff: StaffMember;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:bg-[#fbf9f5] md:grid-cols-12 md:items-center">
      <div className="flex items-center gap-3 md:col-span-4">
        <StaffAvatar staff={staff} />
        <div>
          <h3 className="text-sm font-black text-gray-950">{staff.name}</h3>
          <p className="text-xs text-gray-500">{staff.license}</p>
        </div>
      </div>
      <div className="md:col-span-3">
        <RoleBadge role={staff.role} />
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 md:col-span-2">
        <span className="material-symbols-outlined text-base">public</span>
        {staff.nationality}
      </div>
      <div className="flex justify-start gap-2 md:col-span-3 md:justify-end">
        <ActionButton icon="visibility" label="Xem" onClick={onView} />
        <ActionButton icon="edit" label="Sửa" onClick={onEdit} />
        <ActionButton icon="delete" label="Xóa" danger onClick={onDelete} />
      </div>
    </article>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-block rounded-sm bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      {role}
    </span>
  );
}

function PaginationSummary({
  shown,
  total,
  currentPage,
}: {
  shown: number;
  total: number;
  currentPage: number;
}) {
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min((currentPage - 1) * PAGE_SIZE + shown, total);
  return (
    <section className="px-2 pt-2">
      <span className="text-sm text-gray-600">
        Hiển thị {start} đến {end} trong tổng số {total} thành viên
      </span>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="px-1 text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#008C2F]/20"
      />
      {error && <p className="px-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="px-1 text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#008C2F]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="px-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function downloadCsv(
  filename: string,
  headers: Array<string | number>,
  rows: Array<Array<string | number>>,
) {
  const escapeCell = (value: string | number) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.replace(/[\\/:*?"<>|]+/g, "-");
  link.click();
  URL.revokeObjectURL(url);
}
