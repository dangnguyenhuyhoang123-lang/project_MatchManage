import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/Modal";
import type { SeasonTeamCoach } from "../../../../model/SeasonTeamCoach";
import SeasonTeamCoachService from "../../../../services/SeasonTeamCoachService";
import type { SelectedCoach } from "./RegisterFormMatch";

type Props = {
  setStep?: (step: number) => void;
  selectedCoaches?: SelectedCoach[];
  onCoachesChange?: (coaches: SelectedCoach[]) => void;
};

type Staff = {
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

const DEFAULT_TEAM_ID = 1;
const DEFAULT_TEAM_NAME = "Becamex Bình Dương";

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

const getResponseItems = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content?: unknown }).content)
  ) {
    return (data as { content: T[] }).content;
  }

  return [];
};

const normalizeStaff = (assignment: SeasonTeamCoach & Record<string, any>) => {
  const coach = assignment.coach ?? {};
  const role = assignment.role ?? "ASSISTANT_COACH";

  return {
    assignmentId: assignment.id,
    coachId: assignment.coachId ?? coach.id,
    name: assignment.coachName ?? coach.name ?? "Chưa có tên",
    role,
    idCode: assignment.idCode ?? coach.idCode,
    nationality: assignment.nationality ?? coach.nationality,
    avatar: assignment.avatar ?? coach.avatar,
    status: assignment.status ?? coach.status ?? "ACTIVE",
    assignedDate: assignment.assignedDate,
  } satisfies Staff;
};

const isTeamAssignment = (
  assignment: SeasonTeamCoach & Record<string, any>,
) => {
  if (assignment.teamId == null) {
    return true;
  }

  return String(assignment.teamId) === String(DEFAULT_TEAM_ID);
};

const getStaffKey = (staff: Staff) =>
  staff.assignmentId ?? staff.coachId ?? staff.idCode ?? staff.name;

const normalizeRoleText = (role?: string) =>
  (role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

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

const getRoleLabel = (role: string) => {
  const mappedLabel = roleLabelMap[role];

  if (mappedLabel) {
    return mappedLabel;
  }

  const roleKey = getRoleKey(role);
  const matchedRole = coachRoles.find((item) => item.key === roleKey);

  return matchedRole?.label ?? role;
};

const getBadgeClass = (role: string) => {
  const roleKey = getRoleKey(role);

  if (roleKey === "headCoach") {
    return "bg-green-50 text-green-700";
  }

  if (roleKey === "doctor") {
    return "bg-rose-50 text-rose-600";
  }

  return "bg-blue-50 text-blue-700";
};

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
}) => {
  const [availableStaffs, setAvailableStaffs] = useState<Staff[]>([]);
  const [selectedStaffs, setSelectedStaffs] =
    useState<SelectedCoach[]>(selectedCoaches);
  const [selectedStaffKeys, setSelectedStaffKeys] = useState<
    Array<string | number>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTeamStaffs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await SeasonTeamCoachService.getAllSeasonTeamCoaches(
          0,
          100,
          { teamId: DEFAULT_TEAM_ID },
        );
        const assignments = getResponseItems<
          SeasonTeamCoach & Record<string, any>
        >(response.data);

        setAvailableStaffs(
          assignments.filter(isTeamAssignment).map(normalizeStaff),
        );
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
  }, []);

  const selectedKeySet = useMemo(
    () => new Set(selectedStaffs.map(getStaffKey)),
    [selectedStaffs],
  );

  const unselectedAvailableStaffs = useMemo(
    () =>
      availableStaffs.filter(
        (staff) => !selectedKeySet.has(getStaffKey(staff)),
      ),
    [availableStaffs, selectedKeySet],
  );

  const roleCounts = useMemo(() => {
    return selectedStaffs.reduce<Record<string, number>>((counts, staff) => {
      const roleKey = getRoleKey(staff.role);
      counts[roleKey] = (counts[roleKey] ?? 0) + 1;
      return counts;
    }, {});
  }, [selectedStaffs]);

  const hasRequiredStaff =
    selectedStaffs.length >= 3 &&
    (roleCounts.headCoach ?? 0) >= 1 &&
    (roleCounts.assistant ?? 0) >= 1 &&
    (roleCounts.doctor ?? 0) >= 1;

  const openAddModal = () => {
    setSelectedStaffKeys([]);
    setIsModalOpen(true);
  };

  const toggleSelectStaff = (key: string | number) => {
    setSelectedStaffKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleConfirmSelection = () => {
    const staffToAdd = unselectedAvailableStaffs.filter((staff) =>
      selectedStaffKeys.includes(getStaffKey(staff)),
    );

    const nextStaffs = [...selectedStaffs, ...staffToAdd].slice(0, 8);
    setSelectedStaffs(nextStaffs);
    onCoachesChange?.(nextStaffs);
    setSelectedStaffKeys([]);
    setIsModalOpen(false);
  };

  const removeStaff = (key: string | number) => {
    const nextStaffs = selectedStaffs.filter(
      (staff) => getStaffKey(staff) !== key,
    );
    setSelectedStaffs(nextStaffs);
    onCoachesChange?.(nextStaffs);
  };

  return (
    <>
      <div className="bg-[#fff9c4]/40 border border-[#fbc02d]/30 p-5 rounded-xl mb-8 flex items-start gap-4">
        <span className="material-symbols-outlined text-[#f57f17] text-2xl">
          warning
        </span>
        <div>
          <h3 className="font-bold text-[#f57f17] text-sm">
            Cần chọn ban huấn luyện đăng ký
          </h3>
          <p className="text-[#f57f17]/80 text-xs mt-1">
            Danh sách hiện có{" "}
            <span className="font-bold">{selectedStaffs.length}/8</span> thành
            viên. Cần có HLV trưởng, trợ lý và bác sĩ đội bóng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 pb-24">
        <div className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Đội ngũ Ban huấn luyện{" "}
                <span className="font-normal text-sm text-gray-400 ml-2">
                  ({selectedStaffs.length}/8 thành viên)
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Chọn từ biên chế hiện tại của {DEFAULT_TEAM_NAME}.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={selectedStaffs.length >= 8 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#0d631b] text-xs font-bold rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">
                person_add
              </span>
              Thêm thành viên
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-xl bg-white p-8 text-center text-sm font-bold text-gray-400 border border-gray-100">
                Đang tải danh sách ban huấn luyện...
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl bg-red-50 p-5 text-sm font-bold text-red-600 border border-red-100">
                {errorMessage}
              </div>
            ) : selectedStaffs.length === 0 ? (
              <div
                onClick={openAddModal}
                className="border-2 border-dashed border-gray-200 p-10 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-[#0d631b]/30 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-4xl mb-2">
                  group_add
                </span>
                <p className="text-sm font-bold">
                  Nhấn để chọn ban huấn luyện từ biên chế CLB
                </p>
              </div>
            ) : (
              selectedStaffs.map((staff) => (
                <StaffCard
                  key={getStaffKey(staff)}
                  staff={staff}
                  onRemove={() => removeStaff(getStaffKey(staff))}
                />
              ))
            )}

            {selectedStaffs.length > 0 && selectedStaffs.length < 8 && (
              <div
                onClick={openAddModal}
                className="border border-dashed border-gray-300 p-4 rounded-xl flex items-center justify-center gap-2 text-gray-400 text-xs font-bold bg-white/30 hover:bg-white hover:border-[#0d631b]/30 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Thêm thành viên ban huấn luyện
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>
              Kiểm tra tính hợp lệ
            </h3>

            <ul className="space-y-5">
              <CheckItem passed={selectedStaffs.length >= 3}>
                <p className="text-sm font-bold">Số lượng tối thiểu</p>
                <p className="text-[11px] text-gray-400">
                  {selectedStaffs.length}/8 thành viên (cần tối thiểu 3)
                </p>
              </CheckItem>

              <CheckItem passed={(roleCounts.headCoach ?? 0) >= 1}>
                <p className="text-sm font-bold">Huấn luyện viên trưởng</p>
                <p className="text-[11px] text-gray-400">
                  Bắt buộc có ít nhất 01 người
                </p>
              </CheckItem>

              <CheckItem passed={(roleCounts.assistant ?? 0) >= 1}>
                <p className="text-sm font-bold">Trợ lý huấn luyện viên</p>
                <p className="text-[11px] text-gray-400">
                  Bắt buộc có ít nhất 01 người
                </p>
              </CheckItem>

              <CheckItem passed={(roleCounts.doctor ?? 0) >= 1}>
                <p className="text-sm font-bold">Bác sĩ đội bóng</p>
                <p className="text-[11px] text-gray-400">
                  Bắt buộc có ít nhất 01 người
                </p>
              </CheckItem>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">
                  {Math.min(Math.round((selectedStaffs.length / 8) * 100), 100)}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0d631b] transition-all"
                  style={{
                    width: `${Math.min((selectedStaffs.length / 8) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <section className="bg-[#f5f3ef] p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
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

      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                groups
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {selectedStaffs.length}/8 thành viên
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Danh sách hiện tại
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep?.(1)}
              className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={() => setStep?.(3)}
              disabled={!hasRequiredStaff}
              className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 md:p-8 max-w-2xl w-full bg-white rounded-3xl max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
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

          <p className="text-sm text-gray-500 mb-4">
            Danh sách ban huấn luyện thuộc biên chế {DEFAULT_TEAM_NAME} chưa
            được chọn.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {unselectedAvailableStaffs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">
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
                    className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-100 hover:border-green-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-white text-xs font-bold">
                          check
                        </span>
                      )}
                    </div>

                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full bg-white object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-black border border-green-100">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">
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

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedStaffKeys.length === 0}
              className="px-6 py-2.5 rounded-xl font-bold bg-green-700 text-white shadow-md hover:bg-green-800 disabled:opacity-50 transition-all"
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
};

const StaffCard = ({ staff, onRemove }: StaffCardProps) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 transition-all hover:scale-[1.01]">
    <div className="flex items-center gap-4">
      {staff.avatar ? (
        <img
          src={staff.avatar}
          alt={staff.name}
          className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-black">
          {staff.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div>
        <h4 className="font-bold text-gray-900">{staff.name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span
            className={`text-[10px] px-2 py-0.5 font-bold rounded ${getBadgeClass(
              staff.role,
            )}`}
          >
            {getRoleLabel(staff.role)}
          </span>
          <span className="text-[11px] text-gray-400">
            ID: {staff.coachId ?? staff.idCode ?? "N/A"}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-[#0d631b]">
        check_circle
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="material-symbols-outlined text-gray-300 hover:text-red-500 transition-colors"
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
