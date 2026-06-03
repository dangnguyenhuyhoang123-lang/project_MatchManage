import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  GrassType,
  RegistrationDetailDTO,
  RegistrationStatus,
  RegistrationSummaryDTO,
} from "../../../model/Registration";
import type { SystemRule } from "../../../services/SystemRuleService";
import ConfirmModal from "../../../components/ConfirmModal";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import RegistrationService from "../../../services/RegistrationService";
import SeasonService from "../../../services/SeasonService";
import SystemRuleService from "../../../services/SystemRuleService";
import { AppLayout } from "../../../layouts/AppLayout";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../services/websocket/NotificationSocketService";

type FilterStatus = "ALL" | RegistrationStatus;

type Filters = {
  teamName: string;
  seasonName: string;
  submittedDate: string;
};

const filterTabs: Array<{ value: FilterStatus; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const statusMeta: Record<
  RegistrationStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badgeClass: "bg-indigo-50 text-indigo-700",
    dotClass: "bg-indigo-500",
  },
  APPROVED: {
    label: "Đã duyệt",
    badgeClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-600",
  },
  REJECTED: {
    label: "Từ chối",
    badgeClass: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
};

const grassLabels: Record<GrassType, string> = {
  Standard: "Tự nhiên",
  Synthetic: "Nhân tạo",
  Premium: "Hybrid",
};

const toSearchText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const toDateInputValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatSubmittedAt = (value?: string) => {
  if (!value) {
    return {
      date: "--/--/----",
      time: "--:--",
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      date: value,
      time: "",
    };
  }

  return {
    date: parsed.toLocaleDateString("vi-VN"),
    time: parsed.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const formatMoney = (value?: number | null) => {
  if (value == null) return "--";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatOptionalDateTime = (value?: string | null) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAge = (dateValue?: string) => {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
};

const getClubInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "CLB";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const getRegistrationValidationErrors = (
  detail: RegistrationDetailDTO,
  rule: SystemRule | null,
) => {
  const errors: string[] = [];

  if (!rule) return errors;

  const minPlayersReq = rule.minRegistrationPlayers || rule.minPlayers || 14;
  const maxPlayersReq = rule.maxPlayers || 30;
  const minAgeReq = rule.minAge || 16;
  const maxAgeReq = rule.maxAge || 40;
  const maxForeignReq =
    rule.maxForeignPlayers !== null && rule.maxForeignPlayers !== undefined
      ? rule.maxForeignPlayers
      : 3;

  // 1. Player Count
  const totalPlayers = detail.players.length;
  if (totalPlayers < minPlayersReq) {
    errors.push(`Số lượng cầu thủ (${totalPlayers}) ít hơn mức tối thiểu quy định (${minPlayersReq}).`);
  }
  if (totalPlayers > maxPlayersReq) {
    errors.push(`Số lượng cầu thủ (${totalPlayers}) nhiều hơn mức tối đa quy định (${maxPlayersReq}).`);
  }

  // 2. Player Age
  const invalidAgePlayers = detail.players.filter((p) => {
    const age = calculateAge(p.dateOfBirth);
    if (age === "--") return true;
    const numericAge = Number(age);
    return numericAge < minAgeReq || numericAge > maxAgeReq;
  });
  if (invalidAgePlayers.length > 0) {
    errors.push(
      `Độ tuổi không hợp lệ: Có ${invalidAgePlayers.length} cầu thủ không nằm trong độ tuổi quy định từ ${minAgeReq} đến ${maxAgeReq} tuổi (${invalidAgePlayers.map(p => `${p.name} - ${calculateAge(p.dateOfBirth)}t`).join(", ")}).`
    );
  }

  // 3. Foreign Players
  const isForeignPlayer = (nationality?: string) => {
    if (!nationality) return false;
    const n = nationality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return n !== "viet nam" && n !== "vietnam";
  };
  const foreignCount = detail.players.filter((p) => isForeignPlayer(p.nationality)).length;
  if (foreignCount > maxForeignReq) {
    errors.push(`Số lượng ngoại binh (${foreignCount}) vượt quá giới hạn tối đa cho phép (${maxForeignReq}).`);
  }

  // 4. Duplicate Shirts
  const shirtCounts: Record<number, number> = {};
  detail.players.forEach((p) => {
    if (p.shirtNumber != null) {
      shirtCounts[p.shirtNumber] = (shirtCounts[p.shirtNumber] || 0) + 1;
    }
  });
  const duplicateShirts = Object.keys(shirtCounts)
    .map(Number)
    .filter((num) => shirtCounts[num] > 1);
  if (duplicateShirts.length > 0) {
    errors.push(`Trùng số áo: Các số áo ${duplicateShirts.join(", ")} bị đăng ký trùng lặp.`);
  }

  // 5. Duplicate Players
  const playerIds = new Set<string>();
  const duplicatePlayerNames: string[] = [];
  detail.players.forEach((p) => {
    if (p.idCode) {
      if (playerIds.has(p.idCode)) {
        duplicatePlayerNames.push(p.name);
      } else {
        playerIds.add(p.idCode);
      }
    }
  });
  if (duplicatePlayerNames.length > 0) {
    errors.push(`Trùng lặp cầu thủ: Cầu thủ ${duplicatePlayerNames.join(", ")} bị đăng ký trùng lặp.`);
  }

  // 6. Coaches Checks
  const totalCoaches = detail.coaches.length;
  if (totalCoaches === 0) {
    errors.push(`Danh sách ban huấn luyện trống.`);
  } else {
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
      if (normalizedRole.includes("head_coach") || normalizedRole.includes("hlv truong") || normalizedRole.includes("huan luyen vien truong")) return "headCoach";
      if (normalizedRole.includes("assistant") || normalizedRole.includes("tro ly") || normalizedRole.includes("troly")) return "assistant";
      if (normalizedRole.includes("team_doctor") || normalizedRole.includes("doctor") || normalizedRole.includes("bac si") || normalizedRole.includes("y te")) return "doctor";
      return "other";
    };

    const roleCounts = detail.coaches.reduce<Record<string, number>>((counts, coach) => {
      const roleKey = getRoleKey(coach.role);
      counts[roleKey] = (counts[roleKey] || 0) + 1;
      return counts;
    }, {});

    if ((roleCounts.headCoach ?? 0) < 1) {
      errors.push(`Thiếu Huấn luyện viên trưởng.`);
    }
    if ((roleCounts.assistant ?? 0) < 1) {
      errors.push(`Thiếu Trợ lý huấn luyện viên.`);
    }
    if ((roleCounts.doctor ?? 0) < 1) {
      errors.push(`Thiếu Bác sĩ đội bóng.`);
    }

    const coachIds = new Set<string>();
    const duplicateCoachNames: string[] = [];
    detail.coaches.forEach((c) => {
      if (c.idCode) {
        if (coachIds.has(c.idCode)) {
          duplicateCoachNames.push(c.name);
        } else {
          coachIds.add(c.idCode);
        }
      }
    });
    if (duplicateCoachNames.length > 0) {
      errors.push(`Trùng lặp thành viên ban huấn luyện: ${duplicateCoachNames.join(", ")}.`);
    }
  }

  return errors;
};

const AdminRegistrationManager: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationSummaryDTO[]>(
    [],
  );
  const [selectedRule, setSelectedRule] = useState<SystemRule | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");
  const [filters, setFilters] = useState<Filters>({
    teamName: "",
    seasonName: "",
    submittedDate: "",
  });
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedRegistrationDetail, setSelectedRegistrationDetail] =
    useState<RegistrationDetailDTO | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingApproveId, setPendingApproveId] = useState<number | null>(null);
  const [pendingRejectId, setPendingRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [pendingPayment, setPendingPayment] = useState<{
    id: number;
    proofUrl: string;
  } | null>(null);

  const loadRegistrations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await RegistrationService.getAllRegistrations();
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đăng ký:", error);
      setErrorMessage("Không thể tải danh sách hồ sơ đăng ký.");
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_REGISTRATIONS" ||
        event.referenceType === "REGISTRATION_TEAM"
      ) {
        loadRegistrations();
      }
    },
    [loadRegistrations],
  );

  useRealtimeEvent(handleRealtimeEvent);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeFilter, filters]);

  const seasonOptions = useMemo(() => {
    return Array.from(
      new Set(
        registrations
          .map((registration) => registration.seasonName)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const teamKeyword = toSearchText(filters.teamName);
    const seasonKeyword = toSearchText(filters.seasonName);

    return registrations.filter((registration) => {
      const matchStatus =
        activeFilter === "ALL" || registration.status === activeFilter;
      const matchTeam =
        !teamKeyword ||
        toSearchText(registration.teamName).includes(teamKeyword);
      const matchSeason =
        !seasonKeyword ||
        toSearchText(registration.seasonName).includes(seasonKeyword);
      const matchDate =
        !filters.submittedDate ||
        toDateInputValue(registration.submittedAt) === filters.submittedDate;

      return matchStatus && matchTeam && matchSeason && matchDate;
    });
  }, [activeFilter, filters, registrations]);

  const stats = useMemo(() => {
    return registrations.reduce(
      (current, registration) => {
        current.total += 1;

        if (registration.status === "PENDING") {
          current.pending += 1;
        }

        return current;
      },
      {
        total: 0,
        pending: 0,
      },
    );
  }, [registrations]);

  const visibleRegistrations = filteredRegistrations.slice(0, visibleCount);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilter("ALL");
    setFilters({
      teamName: "",
      seasonName: "",
      submittedDate: "",
    });
  };

  const handleApprove = async (id: number) => {
    setPendingApproveId(id);
  };

  const handleConfirmApprove = async () => {
    if (!pendingApproveId) return;

    setProcessingId(pendingApproveId);

    try {
      const detailRes = await RegistrationService.getRegistrationById(pendingApproveId);
      const detail = detailRes.data;
      if (detail?.seasonId) {
        const seasonRes = await SeasonService.getSeasonById(detail.seasonId);
        const systemRuleId = seasonRes.data?.systemRuleId;
        if (systemRuleId) {
          const ruleRes = await SystemRuleService.getById(systemRuleId);
          const errors = getRegistrationValidationErrors(detail, ruleRes.data);
          if (errors.length > 0) {
            toast.error(`Không thể duyệt hồ sơ do vi phạm các điều luật:\n- ${errors.join("\n- ")}`);
            return;
          }
        }
      }

      if (detail.feeStatus !== "PAID") {
        toast.warning("Hồ sơ chưa xác nhận lệ phí, không thể duyệt.");
        return;
      }

      await RegistrationService.approveRegistration(pendingApproveId);
      if (selectedRegistrationDetail?.id === pendingApproveId) {
        const detailResponse = await RegistrationService.getRegistrationById(pendingApproveId);
        setSelectedRegistrationDetail(detailResponse.data);
      }
      await loadRegistrations();
      toast.success("Đã duyệt hồ sơ đăng ký.");
      setPendingApproveId(null);
    } catch (error) {
      console.error("Lá»—i khi duyá»‡t há»“ sÆ¡:", error);
      toast.error("Không thể duyệt hồ sơ đăng ký.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setPendingRejectId(id);
    setRejectNote("");
  };

  const handleConfirmReject = async () => {
    if (!pendingRejectId) return;

    setProcessingId(pendingRejectId);

    try {
      await RegistrationService.rejectRegistration(pendingRejectId, rejectNote);
      if (selectedRegistrationDetail?.id === pendingRejectId) {
        const detailResponse = await RegistrationService.getRegistrationById(pendingRejectId);
        setSelectedRegistrationDetail(detailResponse.data);
      }
      await loadRegistrations();
      toast.success("Đã từ chối hồ sơ đăng ký.");
      setPendingRejectId(null);
      setRejectNote("");
    } catch (error) {
      console.error("Lá»—i khi Từ chối há»“ sÆ¡:", error);
      toast.error("Không thể từ chối hồ sơ đăng ký.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetail = async (registration: RegistrationSummaryDTO) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailErrorMessage("");
    setSelectedRegistrationDetail(null);
    setSelectedRule(null);

    try {
      const response = await RegistrationService.getRegistrationById(
        registration.id,
      );
      setSelectedRegistrationDetail(response.data);
      if (response.data?.seasonId) {
        const seasonRes = await SeasonService.getSeasonById(response.data.seasonId);
        const systemRuleId = seasonRes.data?.systemRuleId;
        if (systemRuleId) {
          const ruleRes = await SystemRuleService.getById(systemRuleId);
          setSelectedRule(ruleRes.data);
        }
      }
    } catch (error) {
      console.error("Lá»—i khi táº£i chi tiáº¿t há»“ sÆ¡:", error);
      setDetailErrorMessage("Không thể tải chi tiết phiếu đăng ký.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setSelectedRegistrationDetail(null);
    setSelectedRule(null);
    setDetailErrorMessage("");
  };

  const handleConfirmPayment = async (
    id: number,
    paymentProofUrl?: string | null,
  ) => {
    setPendingPayment({ id, proofUrl: paymentProofUrl ?? "" });
  };

  const handleSubmitPayment = async () => {
    if (!pendingPayment) return;

    setProcessingId(pendingPayment.id);

    try {
      await RegistrationService.markRegistrationPaid(
        pendingPayment.id,
        pendingPayment.proofUrl,
      );
      await loadRegistrations();
      const detailResponse = await RegistrationService.getRegistrationById(
        pendingPayment.id,
      );
      setSelectedRegistrationDetail(detailResponse.data);
      toast.success("Đã xác nhận lệ phí hồ sơ.");
      setPendingPayment(null);
    } catch (error) {
      console.error("Cannot confirm registration payment", error);
      toast.error("Không thể xác nhận lệ phí hồ sơ. Vui lòng thử lại.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);

    const rows = filteredRegistrations.map((registration) => ({
      id: `REQ-${registration.id}`,
      teamName: registration.teamName,
      seasonName: registration.seasonName,
      status: statusMeta[registration.status].label,
      playerCount: registration.playerCount,
      coachCount: registration.coachCount,
      submittedAt: registration.submittedAt,
    }));
    const csvHeader = [
      "Mã hồ sơ",
      "Tên đội",
      "Giải đấu",
      "Trạng thái",
      "Sá»‘ cáº§u thá»§",
      "Sá»‘ BHL",
      "Ngày gửi",
    ];
    const csvBody = rows.map((row) =>
      [
        row.id,
        row.teamName,
        row.seasonName,
        row.status,
        row.playerCount,
        row.coachCount,
        row.submittedAt,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [csvHeader.join(","), ...csvBody].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "danh-sach-dang-ky.csv";
    link.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <AppLayout>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-['Be_Vietnam_Pro'] font-black text-gray-900 leading-tight text-4xl">
              Quản lý Danh sách Đăng ký
            </h2>

            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Theo dõi, phê duyệt và quản lý hồ sơ đăng ký tham gia mùa giải từ
              các câu lạc bộ.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredRegistrations.length === 0}
            className="bg-[#008C2F] text-white font-bold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-green-900/15 hover:bg-green-800 disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>{isExporting ? "Đang xuất..." : "Xuất Dữ liệu"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Tổng số đơn"
            value={stats.total}
            icon="assignment"
            iconClassName="bg-[#f5f3ef] text-gray-700"
          />

          <StatCard
            label="Chờ duyệt"
            value={stats.pending}
            icon="schedule"
            valueClassName="text-indigo-700"
            iconClassName="bg-indigo-50 text-indigo-700"
          />

          <div className="md:col-span-2 bg-white rounded-none p-2 border border-gray-100 flex items-center gap-2 overflow-x-auto">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`px-5 py-2.5 rounded-sm text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#f5f3ef] text-gray-900 font-black"
                      : "bg-transparent text-gray-500 hover:bg-[#f5f3ef] font-medium"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <section className="bg-white border border-gray-100 p-5 rounded-none">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                Tên đội
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={filters.teamName}
                  onChange={(event) =>
                    handleFilterChange("teamName", event.target.value)
                  }
                  placeholder="Nhập tên câu lạc bộ..."
                  className="w-full rounded-xl bg-[#f5f3ef] py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-700/20"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                Giải đấu
              </label>
              <select
                value={filters.seasonName}
                onChange={(event) =>
                  handleFilterChange("seasonName", event.target.value)
                }
                className="w-full rounded-xl bg-[#f5f3ef] px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="">Tất cả giải đấu</option>
                {seasonOptions.map((seasonName) => (
                  <option key={seasonName} value={seasonName}>
                    {seasonName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                Ngày gửi
              </label>
              <input
                type="date"
                value={filters.submittedDate}
                onChange={(event) =>
                  handleFilterChange("submittedDate", event.target.value)
                }
                className="w-full rounded-xl bg-[#f5f3ef] px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-700/20"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  filter_alt_off
                </span>
                Xóa lọc
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">CLB</div>
            <div className="col-span-2">Ngày gửi</div>
            <div className="col-span-2">Giải đấu</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {isLoading ? (
            <LoadingSpinner
              message="Đang tải danh sách đăng ký"
              description="Hệ thống đang đồng bộ hồ sơ từ backend để bạn có thể duyệt và theo dõi nhanh hơn."
              fullHeight
            />
          ) : errorMessage ? (
            <div className="rounded-none border border-red-100 bg-red-50 p-8 text-center font-bold text-red-600">
              {errorMessage}
            </div>
          ) : visibleRegistrations.length === 0 ? (
            <div className="rounded-none border border-dashed border-gray-200 bg-white/60 p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300">
                inventory
              </span>
              <p className="mt-3 font-black text-gray-600">
                Không tìm thấy hồ sơ đăng ký
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Thử thay đổi bộ lọc hoặc tải lại danh sách.
              </p>
            </div>
          ) : (
            visibleRegistrations.map((registration) => (
              <RegistrationRow
                key={registration.id}
                registration={registration}
                isProcessing={processingId === registration.id}
                onApprove={handleApprove}
                onReject={handleReject}
                onConfirmPayment={handleConfirmPayment}
                onView={handleViewDetail}
              />
            ))
          )}
        </div>

        {visibleCount < filteredRegistrations.length && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 8)}
              className="font-['Be_Vietnam_Pro'] font-bold py-2.5 px-7 rounded-full bg-[#008C2F] text-white hover:bg-green-800 transition-colors shadow-lg shadow-green-900/10"
            >
              Tải thêm danh sách
            </button>
          </div>
        )}
      </div>

      {isDetailOpen && (
        <RegistrationDetailModal
          detail={selectedRegistrationDetail}
          rule={selectedRule}
          errorMessage={detailErrorMessage}
          isLoading={isDetailLoading}
          onClose={closeDetailModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onConfirmPayment={handleConfirmPayment}
          isProcessing={processingId !== null}
        />
      )}
      <ConfirmModal
        open={pendingApproveId !== null}
        title="Duyệt hồ sơ đăng ký"
        message="Bạn chắc chắn muốn chấp nhận hồ sơ này?"
        confirmText="Duyệt hồ sơ"
        cancelText="Hủy"
        loading={processingId !== null}
        onConfirm={handleConfirmApprove}
        onClose={() => {
          if (processingId === null) setPendingApproveId(null);
        }}
      />
      {pendingRejectId !== null && (
        <ActionInputModal
          title="Từ chối hồ sơ đăng ký"
          message="Nhập lý do từ chối hồ sơ nếu cần."
          value={rejectNote}
          inputType="textarea"
          confirmText="Từ chối"
          danger
          loading={processingId !== null}
          onChange={setRejectNote}
          onClose={() => {
            if (processingId === null) {
              setPendingRejectId(null);
              setRejectNote("");
            }
          }}
          onConfirm={handleConfirmReject}
        />
      )}
      {pendingPayment !== null && (
        <ActionInputModal
          title="Xác nhận lệ phí"
          message="Nhập URL chứng từ thanh toán nếu cần cập nhật."
          value={pendingPayment.proofUrl}
          confirmText="Xác nhận"
          loading={processingId !== null}
          onChange={(proofUrl) =>
            setPendingPayment((current) =>
              current ? { ...current, proofUrl } : current,
            )
          }
          onClose={() => {
            if (processingId === null) setPendingPayment(null);
          }}
          onConfirm={handleSubmitPayment}
        />
      )}
    </AppLayout>
  );
};

type StatCardProps = {
  label: string;
  value: number;
  icon: string;
  valueClassName?: string;
  iconClassName: string;
};

type ActionInputModalProps = {
  title: string;
  message: string;
  value: string;
  inputType?: "input" | "textarea";
  confirmText: string;
  danger?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const ActionInputModal = ({
  title,
  message,
  value,
  inputType = "input",
  confirmText,
  danger = false,
  loading = false,
  onChange,
  onConfirm,
  onClose,
}: ActionInputModalProps) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-bold text-[#1B1C1A]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#707A6C]">{message}</p>
      {inputType === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-xl border border-[#E4E2DE] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-4 w-full rounded-xl border border-[#E4E2DE] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
        />
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-[#E4E2DE] px-4 py-2 text-sm font-semibold text-[#1B1C1A] hover:bg-[#F5F3EF] disabled:opacity-60"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-[#1B1C1A] hover:bg-black"
          }`}
        >
          {loading ? "Đang xử lý..." : confirmText}
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  icon,
  valueClassName = "text-gray-900",
  iconClassName,
}: StatCardProps) => (
  <div className="bg-white rounded-none p-5 border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      <p
        className={`text-3xl font-['Be_Vietnam_Pro'] font-black ${valueClassName}`}
      >
        {value}
      </p>
    </div>

    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center ${iconClassName}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  </div>
);

type RegistrationRowProps = {
  registration: RegistrationSummaryDTO;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onConfirmPayment: (id: number, paymentProofUrl?: string | null) => void;
  onView: (registration: RegistrationSummaryDTO) => void;
};

const RegistrationRow = ({
  registration,
  isProcessing,
  onApprove,
  onReject,
  onConfirmPayment,
  onView,
}: RegistrationRowProps) => {
  const submittedAt = formatSubmittedAt(registration.submittedAt);
  const status = statusMeta[registration.status];
  const isPending = registration.status === "PENDING";

  return (
    <div
      className={`bg-white rounded-none p-4 border border-gray-100 hover:shadow-sm transition-shadow grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center ${
        registration.status === "REJECTED" ? "opacity-80" : ""
      }`}
    >
      <div className="md:col-span-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#f5f3ef] border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-black text-green-700">
          {getClubInitials(registration.teamName)}
        </div>

        <div>
          <h4 className="font-['Be_Vietnam_Pro'] font-black text-gray-900 text-base">
            {registration.teamName}
          </h4>

          <p className="text-xs text-gray-500">ID: REQ-{registration.id}</p>
        </div>
      </div>

      <div className="md:col-span-2 text-sm text-gray-700">
        {submittedAt.date}
        <br />
        <span className="text-xs text-gray-500">{submittedAt.time}</span>
      </div>

      <div className="md:col-span-2 text-sm text-gray-700 font-semibold">
        {registration.seasonName || `Mùa giải #${registration.seasonId}`}
      </div>

      <div className="md:col-span-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${status.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </div>

      <div className="md:col-span-2 flex md:justify-end gap-2">
        <IconButton
          label="Xem chi tiáº¿t"
          icon="visibility"
          className="bg-[#f5f3ef] hover:bg-gray-200 text-gray-700"
          disabled={isProcessing}
          onClick={() => onView(registration)}
        />

        {isPending && (
          <>
            {registration.feeStatus !== "PAID" && (
              <IconButton
                label="Xác nhận lệ phí"
                icon="payments"
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 disabled:opacity-50"
                disabled={isProcessing}
                onClick={() =>
                  onConfirmPayment(registration.id, registration.paymentProofUrl)
                }
              />
            )}
            <IconButton
              label="Cháº¥p nháº­n"
              icon="check"
              className="bg-[#008C2F] hover:bg-green-800 text-white disabled:opacity-50"
              disabled={isProcessing || registration.feeStatus !== "PAID"}
              onClick={() => onApprove(registration.id)}
            />

            <IconButton
              label="Từ chối"
              icon="close"
              className="bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-50"
              disabled={isProcessing}
              onClick={() => onReject(registration.id)}
            />
          </>
        )}
      </div>
    </div>
  );
};

type IconButtonProps = {
  label: string;
  icon: string;
  className: string;
  disabled?: boolean;
  onClick: () => void;
};

const IconButton = ({
  label,
  icon,
  className,
  disabled = false,
  onClick,
}: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${className}`}
    title={label}
    aria-label={label}
  >
    <span className="material-symbols-outlined text-sm">{icon}</span>
  </button>
);

type RegistrationDetailModalProps = {
  detail: RegistrationDetailDTO | null;
  rule: any | null;
  errorMessage: string;
  isLoading: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onConfirmPayment: (id: number, paymentProofUrl?: string | null) => void;
  isProcessing: boolean;
};

const RegistrationDetailModal = ({
  detail,
  rule,
  errorMessage,
  isLoading,
  onClose,
  onApprove,
  onReject,
  onConfirmPayment,
  isProcessing,
}: RegistrationDetailModalProps) => {
  const validationErrors = useMemo(() => {
    if (!detail || !rule) return [];
    return getRegistrationValidationErrors(detail, rule);
  }, [detail, rule]);
  const canApprove =
    Boolean(detail) &&
    detail?.status === "PENDING" &&
    detail?.feeStatus === "PAID" &&
    validationErrors.length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fbf9f5] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
              Chi tiết phiếu đăng ký
            </p>
            <h3 className="mt-1 text-2xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
              {detail ? detail.teamName : "Đang tải hồ sơ"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f3ef] text-gray-600 hover:bg-gray-200"
            aria-label="Đóng chi tiết"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <LoadingSpinner
              message="Đang tải chi tiết phiếu đăng ký"
              description="Vui lòng chờ trong giây lát để hệ thống lấy đầy đủ thông tin đội bóng, cầu thủ và ban huấn luyện."
              fullHeight
            />
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center font-bold text-red-600">
              {errorMessage}
            </div>
          ) : detail ? (
            <div className="grid grid-cols-12 gap-6">
              <section className="col-span-12 lg:col-span-7 space-y-6">
                <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-green-50 text-2xl font-black text-green-700">
                      {detail.logo ? (
                        <img
                          src={detail.logo}
                          alt={detail.teamName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getClubInitials(detail.teamName)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-3xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                        {detail.teamName}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {detail.city || "Chưa cập nhật thành phố"} •{" "}
                        {detail.region || "Chưa cập nhật khu vực"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={detail.status} />
                        <span className="rounded-full bg-[#f5f3ef] px-3 py-1 text-xs font-bold text-gray-600">
                          Mùa giải: {detail.seasonName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InfoCard
                      label="Năm thành lập"
                      value={detail.establishedYear ?? "--"}
                    />
                    <InfoCard label="Chủ sở hữu" value={detail.owner || "--"} />
                    <InfoCard
                      label="Ngày gửi"
                      value={formatSubmittedAt(detail.submittedAt).date}
                    />
                  </div>

                  {detail.description && (
                    <div className="mt-5 rounded-2xl bg-[#f5f3ef] p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Mô tả
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard
                      label="Lệ phí"
                      value={formatMoney(detail.feeAmount)}
                    />
                    <InfoCard
                      label="Trạng thái lệ phí"
                      value={detail.feeStatus ?? "--"}
                    />
                    <InfoCard
                      label="Ngày xác nhận lệ phí"
                      value={formatOptionalDateTime(detail.paidAt)}
                    />
                    <InfoCard
                      label="Chứng từ thanh toán"
                      value={
                        detail.paymentProofUrl ? (
                          <a
                            href={detail.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-700 underline"
                          >
                            Xem chứng từ
                          </a>
                        ) : (
                          "--"
                        )
                      }
                    />
                  </div>

                  {detail.status === "PENDING" && detail.feeStatus !== "PAID" && (
                    <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
                      Hồ sơ chưa xác nhận lệ phí, không thể duyệt.
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <KitPreview
                      title="Áo chính thức"
                      color={detail.homeKitColor}
                      imageUrl={detail.homeKitImageUrl}
                    />
                    <KitPreview
                      title="Áo dự bị"
                      color={detail.awayKitColor}
                      imageUrl={detail.awayKitImageUrl}
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                        Danh sách cầu thủ
                      </h4>
                      <p className="text-sm text-gray-500">
                        {detail.players.length} cầu thủ trong hồ sơ
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-green-700">
                      groups
                    </span>
                  </div>

                  <div className="space-y-2">
                    {detail.players.length === 0 ? (
                      <EmptyDetail text="Không có cầu thủ trong hồ sơ." />
                    ) : (
                      detail.players.map((player) => (
                        <div
                          key={`${player.idCode}-${player.shirtNumber}`}
                          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-12 md:items-center"
                        >
                          <div className="md:col-span-5">
                            <p className="font-black text-gray-900">
                              {player.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              CCCD: {player.idCode}
                            </p>
                          </div>
                          <div className="md:col-span-2 text-sm font-bold text-gray-700">
                            Số {player.shirtNumber}
                          </div>
                          <div className="md:col-span-2 text-sm text-gray-600">
                            {player.position}
                          </div>
                          <div className="md:col-span-3 flex flex-wrap gap-2 md:justify-end">
                            <span className="rounded-full bg-[#f5f3ef] px-3 py-1 text-xs font-bold text-gray-600">
                              {player.nationality}
                            </span>
                            <span className="rounded-full bg-[#f5f3ef] px-3 py-1 text-xs font-bold text-gray-600">
                              {calculateAge(player.dateOfBirth)} tuổi
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                player.official
                                  ? "bg-green-50 text-green-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {player.official ? "Chính thức" : "Dự bị"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="col-span-12 lg:col-span-5 space-y-6">
                {rule && (
                  <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-lg font-black text-gray-900 font-['Be_Vietnam_Pro'] flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-700">fact_check</span>
                        Kiểm tra bộ luật giải đấu
                      </h4>
                    </div>
                    
                    {validationErrors.length > 0 ? (
                      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-red-800 flex items-center gap-1.5 font-bold">
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Phát hiện {validationErrors.length} lỗi vi phạm
                        </p>
                        <ul className="list-disc list-inside text-xs text-red-700 space-y-1.5">
                          {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-green-800 flex items-center gap-1.5 font-bold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Hồ sơ hoàn toàn hợp lệ
                        </p>
                        <p className="mt-1 text-xs text-green-700">
                          Đơn đăng ký tuân thủ đầy đủ các quy tắc quy định trong bộ luật của mùa giải này.
                        </p>
                      </div>
                    )}

                    {detail.status === "PENDING" && (
                      <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 sm:flex-row">
                        {detail.feeStatus !== "PAID" && (
                          <button
                            type="button"
                            onClick={() =>
                              onConfirmPayment(detail.id, detail.paymentProofUrl)
                            }
                            disabled={isProcessing}
                            className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Xác nhận lệ phí
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onApprove(detail.id);
                            onClose();
                          }}
                          disabled={!canApprove || isProcessing}
                          className="flex-1 bg-[#008C2F] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          Duyệt hồ sơ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onReject(detail.id);
                            onClose();
                          }}
                          disabled={isProcessing}
                          className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {detail.status === "PENDING" && !rule && (
                  <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
                    {detail.feeStatus !== "PAID" && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
                        Hồ sơ chưa xác nhận lệ phí, không thể duyệt.
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {detail.feeStatus !== "PAID" && (
                        <button
                          type="button"
                          onClick={() =>
                            onConfirmPayment(detail.id, detail.paymentProofUrl)
                          }
                          disabled={isProcessing}
                          className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Xác nhận lệ phí
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onApprove(detail.id);
                          onClose();
                        }}
                        disabled={!canApprove || isProcessing}
                        className="flex-1 bg-[#008C2F] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Duyệt hồ sơ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onReject(detail.id);
                          onClose();
                        }}
                        disabled={isProcessing}
                        className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                        Sân vận động
                      </h4>
                      <p className="text-sm text-gray-500">
                        Thông tin địa điểm thi đấu
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-green-700">
                      stadium
                    </span>
                  </div>

                  <div className="space-y-3">
                    <InfoCard label="Tên sân" value={detail.stadiumName} />
                    <InfoCard label="Địa chỉ" value={detail.stadiumAddress} />
                    <InfoCard
                      label="Sức chứa"
                      value={`${detail.stadiumCapacity.toLocaleString("vi-VN")} người`}
                    />
                    <InfoCard
                      label="Mặt cỏ"
                      value={grassLabels[detail.stadiumGrass]}
                    />
                    <InfoCard
                      label="Quốc gia"
                      value={detail.stadiumCountry ?? "--"}
                    />
                    <InfoCard
                      label="Chuẩn sao FIFA"
                      value={
                        detail.fifaStarRating != null
                          ? `${detail.fifaStarRating} sao`
                          : "--"
                      }
                    />
                    <InfoCard
                      label="Chứng nhận sân"
                      value={
                        detail.certificateUrl ? (
                          <a
                            href={detail.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-700 underline"
                          >
                            Xem chứng nhận
                          </a>
                        ) : (
                          "--"
                        )
                      }
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
                        Ban huấn luyện
                      </h4>
                      <p className="text-sm text-gray-500">
                        {detail.coaches.length} thành viên trong hồ sơ
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-green-700">
                      manage_accounts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {detail.coaches.length === 0 ? (
                      <EmptyDetail text="Không có ban huấn luyện trong hồ sơ." />
                    ) : (
                      detail.coaches.map((coach) => (
                        <div
                          key={`${coach.idCode}-${coach.role}`}
                          className="rounded-2xl bg-[#f5f3ef] p-4"
                        >
                          <p className="font-black text-gray-900">{coach.name}</p>
                          <p className="mt-1 text-xs font-bold text-green-700">
                            {coach.role}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {coach.nationality} • {calculateAge(coach.birthDay)}{" "}
                            tuổi • CCCD: {coach.idCode}
                          </p>
                          {coach.description && (
                            <p className="mt-2 text-xs text-gray-500">
                              {coach.description}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {detail.note && (
                  <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                      Ghi chú
                    </p>
                    <p className="mt-2 text-sm text-amber-700">{detail.note}</p>
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: RegistrationStatus }) => {
  const meta = statusMeta[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${meta.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
};

const InfoCard = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-[#f5f3ef] p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-black text-gray-900">{value}</p>
  </div>
);

const KitPreview = ({
  title,
  color,
  imageUrl,
}: {
  title: string;
  color?: string | null;
  imageUrl?: string | null;
}) => (
  <div className="rounded-2xl bg-[#f5f3ef] p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {title}
    </p>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={title}
        className="mt-3 h-36 w-full rounded-xl object-cover bg-white"
      />
    ) : (
      <div className="mt-3 flex items-center gap-3">
        <span
          className="h-10 w-10 rounded-xl border border-gray-200 bg-white"
          style={{ backgroundColor: color || "#ffffff" }}
        />
        <span className="text-sm font-black text-gray-900">
          {color || "Chưa cập nhật màu áo"}
        </span>
      </div>
    )}
  </div>
);

const EmptyDetail = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-5 text-center text-sm font-bold text-gray-400">
    {text}
  </div>
);

export default AdminRegistrationManager;
