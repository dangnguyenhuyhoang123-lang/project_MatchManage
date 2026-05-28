import React, { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../../../../layouts/AppLayout";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import { PhanTrang } from "../../../../utils/PhanTrang";
import CoachService from "../../../../services/CoachService";
import type { Coach } from "../../../../model/CoachModel";
import TeamService from "../../../../services/TeamService";
import {
  calculateAge,
  fallbackAvatar,
  initials,
  removeVietnameseMark,
  statusLabel,
  useCurrentClubId,
} from "./clubInfoHelpers";
import type { TeamModel } from "../../../../model/TeamModel";

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
}

const PAGE_SIZE = 8;

const ClubStaffPage: React.FC = () => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState<TeamModel | null>(null);
  useEffect(() => {
    let mounted = true;

    const loadStaff = async () => {
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

        const data = await CoachService.getCoachesByTeamNormalized(
          currentClubId,
          currentPage - 1,
          PAGE_SIZE,
        );

        const data_team = await TeamService.getTeamById(currentClubId);

        if (mounted) {
          setTeam(data_team);
        }
        if (!mounted) return;

        setStaff(
          (data.content ?? [])
            .map(normalizeStaff)
            .filter((member: StaffMember | null): member is StaffMember =>
              Boolean(member),
            ),
        );
        setTotalPages(Number(data.totalPages ?? 1));
        setTotalElements(
          Number(data.totalElements ?? data.content?.length ?? 0),
        );
      } catch (err) {
        console.error("Cannot load staff", err);
        if (mounted) {
          setError("Không thể tải danh sách ban huấn luyện từ API.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStaff();

    return () => {
      mounted = false;
    };
  }, [authLoading, currentClubId, currentPage]);

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

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-10 font-['Be_Vietnam_Pro']">
        <StaffHeader total={totalElements} team={team} />

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <CoachingStaffGrid staff={coachingStaff} loading={loading} />

        <MedicalPerformanceSection staff={medicalStaff} loading={loading} />

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

function StaffHeader({ total, team }: { total: number; team: TeamModel }) {
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

      <button
        type="button"
        className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d631b] hover:shadow-lg hover:shadow-green-900/20"
      >
        <span className="material-symbols-outlined relative z-10 text-sm">
          download
        </span>
        <span className="relative z-10">Xuất danh sách</span>
      </button>
    </section>
  );
}

function CoachingStaffGrid({
  staff,
  loading,
}: {
  staff: StaffMember[];
  loading: boolean;
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
        staff.map((member) => <StaffCard key={member.id} staff={member} />)
      )}
    </section>
  );
}

function StaffCard({ staff }: { staff: StaffMember }) {
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

      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:bg-[#f5f3ef] hover:text-gray-900"
      >
        <span className="material-symbols-outlined text-sm">visibility</span>
        Xem hồ sơ
      </button>
    </article>
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
}: {
  staff: StaffMember[];
  loading: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-black text-gray-950">Y tế & thể lực</h2>

      <div className="space-y-2">
        <div className="hidden grid-cols-12 gap-4 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-gray-600 md:grid">
          <div className="col-span-4">Thành viên</div>
          <div className="col-span-3">Vai trò</div>
          <div className="col-span-2">Quốc tịch</div>
          <div className="col-span-3 text-right">Trạng thái</div>
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
            <MedicalStaffRow key={member.id} staff={member} />
          ))
        )}
      </div>
    </section>
  );
}

function MedicalStaffRow({ staff }: { staff: StaffMember }) {
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

      <div className="flex justify-start md:col-span-3 md:justify-end">
        <span className="rounded-full bg-[#008C2F]/10 px-3 py-1 text-xs font-black text-[#008C2F]">
          {staff.status}
        </span>
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
