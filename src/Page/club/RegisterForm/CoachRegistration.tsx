import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "../../../components/Modal";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import type { Coach } from "../../../model/CoachModel";
import CoachService from "../../../services/CoachService";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";
import type { SelectedCoach } from "./RegisterFormMatch";
import type { SystemRule } from "../../../services/SystemRuleService";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";

type Props = {
  setStep?: (step: number) => void;
  selectedCoaches?: SelectedCoach[];
  onCoachesChange?: (coaches: SelectedCoach[]) => void;
  rule?: SystemRule | null;
};

type Staff = {
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

const coachRoles = [
  { value: "HLV trưởng", label: "Huấn luyện viên trưởng", key: "headCoach" },
  { value: "Trợ lý", label: "Trợ lý huấn luyện viên", key: "assistant" },
  { value: "HLV thủ môn", label: "Huấn luyện viên thủ môn", key: "goalkeeper" },
  { value: "HLV thể lực", label: "Huấn luyện viên thể lực", key: "fitness" },
  { value: "Bác sĩ", label: "Bác sĩ đội bóng", key: "doctor" },
];

const roleLabelMap = coachRoles.reduce<Record<string, string>>((map, role) => {
  map[role.value] = role.label;
  map[role.label] = role.label;
  return map;
}, {});

// Chuẩn hóa staff.
const normalizeStaff = (coach: Coach & Record<string, any>) => {
  const role = coach.description ?? coach.role ?? "Trợ lý";

  return {
    coachId: coach.id,
    name: coach.name ?? "Chưa có tên",
    role,
    idCode: coach.idCode ?? coach.id_code ?? coach.identityCode ?? coach.cccd,
    id_code: coach.id_code,
    identityCode: coach.identityCode,
    cccd: coach.cccd,
    nationality: coach.nationality,
    avatar: coach.avatar,
    status: coach.status ?? "ACTIVE",
  } satisfies Staff;
};

// Lấy coach id code.
const getCoachIdCode = (coach: any) =>
  String(
    coach.idCode ?? coach.id_code ?? coach.identityCode ?? coach.cccd ?? "",
  ).trim();

// Lấy staff key.
const getStaffKey = (staff: any) =>
  staff.assignmentId ?? staff.coachId ?? getCoachIdCode(staff) ?? staff.name;

// Tạo khóa so sánh staff đã chọn.
const getStaffSnapshot = (staff: any) =>
  [
    getStaffKey(staff),
    staff.name ?? "",
    staff.role ?? "",
    getCoachIdCode(staff),
    staff.status ?? "",
  ].join("|");

// Kiểm tra danh sách staff có thay đổi không.
const areSameStaffs = (a: SelectedCoach[], b: SelectedCoach[]) => {
  if (a.length !== b.length) return false;

  return a.every((staff, index) => {
    return getStaffSnapshot(staff) === getStaffSnapshot(b[index]);
  });
};

// Chuẩn hóa role text.
const normalizeRoleText = (role?: string) =>
  (role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

// Lấy role key.
const getRoleKey = (role?: string) => {
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

  if (
    normalizedRole.includes("goalkeeper") ||
    normalizedRole.includes("thu mon")
  ) {
    return "goalkeeper";
  }

  if (
    normalizedRole.includes("fitness") ||
    normalizedRole.includes("the luc")
  ) {
    return "fitness";
  }

  return "other";
};

// Lấy role label.
const getRoleLabel = (role: string) => {
  const mappedLabel = roleLabelMap[role];

  if (mappedLabel) {
    return mappedLabel;
  }

  const roleKey = getRoleKey(role);
  const matchedRole = coachRoles.find((item) => item.key === roleKey);

  return matchedRole?.label ?? role;
};

// const getBadgeClass = (role: string) => {
//   const roleKey = getRoleKey(role);

//   if (roleKey === "headCoach") {
//     return "bg-green-50 text-green-700";
//   }

//   if (roleKey === "doctor") {
//     return "bg-rose-50 text-rose-600";
//   }

//   return "bg-blue-50 text-blue-700";
// };

const formatDate = (date?: string) => {
  if (!date) {
    return "Chưa cập nhật";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("vi-VN");
};

const CoachRegistration: React.FC<Props> = ({
  setStep,
  selectedCoaches = [],
  onCoachesChange,
  rule,
}) => {
  const { currentClubId, authLoading } = useCurrentClubId();

  // Lưu trữ danh sách huấn luyện viên thuộc câu lạc bộ (để đưa vào hồ sơ đk)
  const [availableStaffs, setAvailableStaffs] = useState<Staff[]>([]);

  // Lưu trữ danh sách huấn luyện viên được chọn
  const [selectedStaffs, setSelectedStaffs] =
    useState<SelectedCoach[]>(selectedCoaches);

  const [selectedStaffKeys, setSelectedStaffKeys] = useState<
    Array<string | number>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSelectedStaffs((currentStaffs) => {
      if (areSameStaffs(currentStaffs, selectedCoaches)) {
        return currentStaffs;
      }

      return selectedCoaches;
    });
  }, [selectedCoaches]);

  useEffect(() => {
    // Lấy danh sách ban huấn luyện theo id câu lạc bộ.
    const fetchTeamStaffs = async () => {
      if (authLoading) return;

      if (!currentClubId) {
        setAvailableStaffs([]);
        setErrorMessage(
          "Không xác định được câu lạc bộ của người dùng đang đăng nhập.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        // Registration phải lấy Coach gốc theo CLB, không lấy CoachSeason/SeasonTeamCoach.
        // SeasonTeamCoach chỉ được backend tạo sau khi ADMIN duyệt hồ sơ.
        const response = await CoachService.getCoachesByTeamNormalized(
          currentClubId,
          0,
          500,
        );
        setAvailableStaffs((response.content ?? []).map(normalizeStaff));
      } catch (error) {
        console.error("Lỗi khi tải danh sách ban huấn luyện:", error);
        setErrorMessage(
          "Không thể tải danh sách ban huấn luyện của câu lạc bộ.",
        );
        setAvailableStaffs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamStaffs();
  }, [authLoading, currentClubId, reloadKey]);

  const handleRealtimeEvent = useCallback((event: RealtimeEventDTO) => {
    if (
      event.action === "REFETCH_COACHES" ||
      event.action === "REFETCH_TEAMS"
    ) {
      setReloadKey((current) => current + 1);
    }
  }, []);

  useRealtimeEvent(handleRealtimeEvent);

  // Lưu trữ key của huấn luyện viên đã chọn(dùng để loại khỏi available list)
  const selectedKeySet = useMemo(
    () => new Set(selectedStaffs.map(getStaffKey)),
    [selectedStaffs],
  );

  // Lưu trữ danh sách huấn luyện vieen chưa được trong(Trong modal)
  const unselectedAvailableStaffs = useMemo(
    () =>
      availableStaffs.filter(
        (staff) => !selectedKeySet.has(getStaffKey(staff)),
      ),
    [availableStaffs, selectedKeySet],
  );

  // Đếm số lượng HLV theo vai trò
  const roleCounts = useMemo(() => {
    return selectedStaffs.reduce<Record<string, number>>((counts, staff) => {
      const roleKey = getRoleKey(staff.role);
      counts[roleKey] = (counts[roleKey] ?? 0) + 1;
      return counts;
    }, {});
  }, [selectedStaffs]);

  // Lưu trữ số huấn luyện viên tối thiểu theo rule mùa giải
  const minCoaches = rule?.minCoaches ?? 1;

  // Lưu trữ số huấn luyện viên tối đa theo rule mùa giải
  const maxCoaches = rule?.maxCoaches ?? 8;

  // Kiểm tra số lượgn HLV trưởng có đúng k
  const hasExactlyOneHeadCoach = (roleCounts.headCoach ?? 0) === 1;

  // Kiểm tra số lượng huấn luyện viên có đáp ứng theo rule k và kiểm tra có đúng 1 HLV không
  const hasRequiredStaff =
    selectedStaffs.length >= minCoaches &&
    selectedStaffs.length <= maxCoaches &&
    hasExactlyOneHeadCoach;

  // Kiểm tra trùng HLV
  const duplicateCoaches = useMemo(() => {
    const ids = new Set<any>();
    const dupes: string[] = [];
    selectedStaffs.forEach((c) => {
      const id = getStaffKey(c);
      if (ids.has(id)) {
        dupes.push(c.name);
      } else {
        ids.add(id);
      }
    });
    return dupes;
  }, [selectedStaffs]);

  // Kiểm tra các huấn luyện viện được có vai trò chưa
  const hasEmptyRole = useMemo(() => {
    return selectedStaffs.some((c) => !c.role);
  }, [selectedStaffs]);

  // Số lượng huấn luyện viên thiếu idcode
  const missingIdCodeCoaches = useMemo(
    () => selectedStaffs.filter((coach) => !getCoachIdCode(coach)),
    [selectedStaffs],
  );

  const isValid =
    hasRequiredStaff &&
    duplicateCoaches.length === 0 &&
    !hasEmptyRole &&
    missingIdCodeCoaches.length === 0;

  // Mở modal hoac khung thao tác.
  const openAddModal = () => {
    setSelectedStaffKeys([]);
    setIsModalOpen(true);
  };

  // Xử lý select staff.
  const toggleSelectStaff = (key: string | number) => {
    setSelectedStaffKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  // Xử lý xác nhận thao tác.
  const handleConfirmSelection = () => {
    const staffToAdd = unselectedAvailableStaffs.filter((staff) =>
      selectedStaffKeys.includes(getStaffKey(staff)),
    );

    const nextStaffs = [...selectedStaffs, ...staffToAdd].slice(0, maxCoaches);
    const nextHeadCoachCount = nextStaffs.filter(
      (staff) => getRoleKey(staff.role) === "headCoach",
    ).length;

    if (nextHeadCoachCount > 1) {
      toast.warning("Mỗi hồ sơ đăng ký chỉ được chọn 01 HLV trưởng.");
      return;
    }

    setSelectedStaffs(nextStaffs);
    onCoachesChange?.(nextStaffs);
    setSelectedStaffKeys([]);
    setIsModalOpen(false);
  };

  // Xóa HLV khỏi danh sách .
  const removeStaff = (key: string | number) => {
    const nextStaffs = selectedStaffs.filter(
      (staff) => getStaffKey(staff) !== key,
    );
    setSelectedStaffs(nextStaffs);
    onCoachesChange?.(nextStaffs);
  };

  // Xử lý role change(thực hiện cập nhật role khi đổi vai trò).
  const handleRoleChange = (key: string | number, newRole: string) => {
    if (getRoleKey(newRole) === "headCoach") {
      const hasOtherHeadCoach = selectedStaffs.some(
        (staff) =>
          getStaffKey(staff) !== key && getRoleKey(staff.role) === "headCoach",
      );

      if (hasOtherHeadCoach) {
        toast.warning("Mỗi hồ sơ đăng ký chỉ được có 01 HLV trưởng.");
        return;
      }
    }

    const nextStaffs = selectedStaffs.map((staff) => {
      if (getStaffKey(staff) === key) {
        return { ...staff, role: newRole };
      }
      return staff;
    });
    setSelectedStaffs(nextStaffs);
    onCoachesChange?.(nextStaffs);
  };

  return (
    <>
      {
        // Kiểm tra các validate huấn luyện viên
        !isValid || selectedStaffs.length === 0 ? (
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
            <span className="material-symbols-outlined text-2xl text-red-600">
              error
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800">
                Yêu cầu ban huấn luyện chưa hoàn thành
              </h3>
              <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                {selectedStaffs.length === 0 && (
                  <li>
                    Danh sách ban huấn luyện trống. Vui lòng thêm thành viên ban
                    huấn luyện.
                  </li>
                )}
                {selectedStaffs.length > 0 &&
                  (selectedStaffs.length < minCoaches ||
                    selectedStaffs.length > maxCoaches) && (
                    <li>
                      Ban huấn luyện phải có từ {minCoaches} đến {maxCoaches}{" "}
                      người theo quy định mùa giải.
                    </li>
                  )}
                {(roleCounts.headCoach ?? 0) < 1 && (
                  <li>
                    Thiếu HLV trưởng: Phải đăng ký đúng 01 Huấn luyện viên
                    trưởng.
                  </li>
                )}
                {(roleCounts.headCoach ?? 0) > 1 && (
                  <li>
                    Dư HLV trưởng: Mỗi hồ sơ đăng ký chỉ được có 01 Huấn luyện
                    viên trưởng.
                  </li>
                )}
                {hasEmptyRole && (
                  <li>
                    Có thành viên chưa được phân vai trò. Vui lòng điền đầy đủ
                    vai trò.
                  </li>
                )}
                {duplicateCoaches.length > 0 && (
                  <li>
                    Trùng lặp thành viên: {duplicateCoaches.join(", ")} bị chọn
                    trùng.
                  </li>
                )}
                {missingIdCodeCoaches.length > 0 && (
                  <li>
                    Thiếu mã định danh HLV:{" "}
                    {missingIdCodeCoaches.map((coach) => coach.name).join(", ")}
                    .
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-5">
            <span className="material-symbols-outlined text-2xl text-green-600">
              check_circle
            </span>
            <div>
              <h3 className="text-sm font-bold text-green-800">
                Ban huấn luyện đã sẵn sàng
              </h3>
              <p className="mt-1 text-xs text-green-700/80">
                Đã chọn đúng 01 HLV trưởng, đủ số lượng theo rule mùa giải và
                không có vi phạm.
              </p>
            </div>
          </div>
        )
      }

      <div className="grid grid-cols-12 gap-8 pb-24">
        <div className="col-span-12 xl:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Đội ngũ Ban huấn luyện{" "}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({selectedStaffs.length}/{maxCoaches} thành viên)
                </span>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Chọn từ biên chế hiện tại của câu lạc bộ.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={selectedStaffs.length >= maxCoaches || isLoading}
              className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-[#0d631b] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                person_add
              </span>
              Thêm thành viên
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <LoadingSpinner
                message="Đang tải danh sách ban huấn luyện"
                description="Danh sách ban huấn luyện thuộc biên chế câu lạc bộ đang được đồng bộ."
                fullHeight
              />
            ) : errorMessage ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-600">
                {errorMessage}
              </div>
            ) : selectedStaffs.length === 0 ? (
              <div
                onClick={openAddModal}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10 text-gray-400 transition-all hover:border-[#0d631b]/30 hover:bg-white"
              >
                <span className="material-symbols-outlined mb-2 text-4xl">
                  group_add
                </span>
                <p className="text-sm font-bold">
                  Nhấn để chọn ban huấn luyện từ biên chế CLB
                </p>
              </div>
            ) : (
              <div className="max-h-[724px] space-y-3 overflow-y-auto pr-2">
                {selectedStaffs.map((staff) => (
                  <StaffCard
                    key={getStaffKey(staff)}
                    staff={staff}
                    onRemove={() => removeStaff(getStaffKey(staff))}
                    onRoleChange={(newRole) =>
                      handleRoleChange(getStaffKey(staff), newRole)
                    }
                  />
                ))}
              </div>
            )}

            {selectedStaffs.length > 0 &&
              selectedStaffs.length < maxCoaches && (
                <div
                  onClick={openAddModal}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white/30 p-4 text-xs font-bold text-gray-400 transition-all hover:border-[#0d631b]/30 hover:bg-white"
                >
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
                  Thêm thành viên ban huấn luyện
                </div>
              )}
          </div>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-gray-900">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>
              Kiểm tra tính hợp lệ
            </h3>

            {/* Check validate hiển thị trên UI */}
            <ul className="space-y-5">
              <CheckItem
                passed={
                  selectedStaffs.length >= minCoaches &&
                  selectedStaffs.length <= maxCoaches
                }
              >
                <p className="text-sm font-bold">Số lượng ban huấn luyện</p>
                <p className="text-[11px] text-gray-400">
                  Đã chọn {selectedStaffs.length}, yêu cầu từ {minCoaches} đến{" "}
                  {maxCoaches}
                </p>
              </CheckItem>

              <CheckItem passed={hasExactlyOneHeadCoach}>
                <p className="text-sm font-bold">Huấn luyện viên trưởng</p>
                <p className="text-[11px] text-gray-400">
                  Bắt buộc có đúng 01 người
                </p>
              </CheckItem>

              <CheckItem passed={missingIdCodeCoaches.length === 0}>
                <p className="text-sm font-bold">Mã định danh HLV</p>
                <p className="text-[11px] text-gray-400">
                  {missingIdCodeCoaches.length === 0
                    ? "Tất cả HLV đã có idCode"
                    : `${missingIdCodeCoaches.length} HLV thiếu mã định danh`}
                </p>
              </CheckItem>
            </ul>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="mb-2 flex justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">
                  {Math.min(
                    Math.round((selectedStaffs.length / maxCoaches) * 100),
                    100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-[#0d631b] transition-all"
                  style={{
                    width: `${Math.min((selectedStaffs.length / maxCoaches) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-[#f5f3ef] p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <span className="material-symbols-outlined text-[#0d631b]">
                groups
              </span>
              Biên chế CLB
            </h3>

            <div className="space-y-3 text-sm">
              {coachRoles.slice(0, 5).map((role) => (
                <div
                  key={role.value}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-500">{role.label}</span>
                  <span className="font-black text-gray-900">
                    {roleCounts[role.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-10 left-64 right-0 z-40 flex justify-center px-10">
        <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-gray-100 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <span className="material-symbols-outlined text-green-700">
                groups
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Đã chọn {selectedStaffs.length}/{maxCoaches} ban huấn luyện
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Danh sách hiện tại
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep?.(1)}
              className="rounded-full px-8 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={() => setStep?.(3)}
              disabled={isLoading}
              className="rounded-full bg-green-700 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-green-700/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">
              Chọn ban huấn luyện
            </h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Danh sách ban huấn luyện thuộc biên chế câu lạc bộ chưa được chọn.
          </p>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <LoadingSpinner
                message="Đang tải danh sách ban huấn luyện"
                description="Hệ thống đang đồng bộ nhân sự để bạn chọn nhanh hơn."
                fullHeight
              />
            ) : unselectedAvailableStaffs.length === 0 ? (
              <div className="py-10 text-center font-bold text-gray-400">
                Không còn thành viên ban huấn luyện nào để chọn
              </div>
            ) : (
              unselectedAvailableStaffs.map((staff) => {
                const staffKey = getStaffKey(staff);
                const isSelected = selectedStaffKeys.includes(staffKey);

                return (
                  <div
                    key={staffKey}
                    onClick={() => toggleSelectStaff(staffKey)}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-100 hover:border-green-300"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        isSelected
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs font-bold text-white">
                          check
                        </span>
                      )}
                    </div>

                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="h-10 w-10 rounded-full border border-gray-100 bg-white object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-100 bg-green-50 font-black text-green-700">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">
                        {staff.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {getRoleLabel(staff.role)} • Vào biên chế:{" "}
                        {formatDate(staff.assignedDate)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedStaffKeys.length === 0}
              className="rounded-xl bg-green-700 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-green-800 disabled:opacity-50"
            >
              Xác nhận chọn ({selectedStaffKeys.length})
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

type StaffCardProps = {
  staff: Staff;
  onRemove: () => void;
  onRoleChange: (role: string) => void;
};

// Hiển thị StaffCard.
const StaffCard = ({ staff, onRemove, onRoleChange }: StaffCardProps) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition-all hover:scale-[1.01]">
    <div className="flex items-center gap-4 flex-1">
      {staff.avatar ? (
        <img
          src={staff.avatar}
          alt={staff.name}
          className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 font-black text-green-700">
          {staff.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div>
        <h4 className="font-bold text-gray-900">{staff.name}</h4>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[11px] text-gray-400">
            ID: {staff.coachId ?? staff.idCode ?? "N/A"}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <select
        value={staff.role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-700/20"
      >
        <option value="">-- Chọn vai trò --</option>
        {coachRoles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <span className="material-symbols-outlined text-[#0d631b]">
        check_circle
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="material-symbols-outlined text-gray-300 transition-colors hover:text-red-500"
      >
        delete
      </button>
    </div>
  </div>
);

type CheckItemProps = {
  passed: boolean;
  children: React.ReactNode;
};

// Hiển thị CheckItem.
const CheckItem = ({ passed, children }: CheckItemProps) => (
  <li className="flex items-start gap-3">
    <span
      className={`material-symbols-outlined ${
        passed ? "text-[#0d631b]" : "text-red-500"
      }`}
    >
      {passed ? "check_circle" : "cancel"}
    </span>
    <div>{children}</div>
  </li>
);

export default CoachRegistration;
