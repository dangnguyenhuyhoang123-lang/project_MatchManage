import React, { useEffect, useMemo, useState } from "react";
import type { SystemRule } from "../../../model/SystemRule";
import SystemRuleService from "../../../services/SystemRuleService";
import SeasonService from "../../../services/SeasonService";
import { extractApiErrorMessage } from "../../../utils/apiError";

interface Props {
  onClose: () => void;
  leagueId: number;
  currentSeason?: any | null;
  onSuccess: () => void;
}
function extractArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data?.content)) return value.data.content;
  return [];
}
const toDateInputValue = (value?: string | null) =>
  value ? value.split("T")[0] : "";

export default function CreateSeasonModal({
  onClose,
  leagueId,
  currentSeason,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [systemRuleId, setSystemRuleId] = useState<number | "">("");
  const [rules, setRules] = useState<SystemRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<SystemRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(currentSeason?.id);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await SystemRuleService.getAllNoPaging();
        const ruleList = extractArray<any>(response);

        console.log("CreateSeasonModal rules raw:", response);
        console.log("CreateSeasonModal rules parsed:", ruleList);

        setRules(ruleList);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bộ luật:", err);
      }
    };
    loadRules();
  }, []);

  useEffect(() => {
    if (currentSeason) {
      setName(currentSeason.name || "");
      setYear(currentSeason.year || "");
      setStartDate(toDateInputValue(currentSeason.startDate));
      setEndDate(toDateInputValue(currentSeason.endDate));
      setSystemRuleId(currentSeason.systemRuleId || "");
    } else {
      const currentYear = new Date().getFullYear();
      setName("");
      setYear(`${currentYear}/${currentYear + 1}`);
      setStartDate("");
      setEndDate("");
      setSystemRuleId("");
    }
    setErrorMsg("");
  }, [currentSeason]);

  useEffect(() => {
    if (systemRuleId) {
      const safeRules = Array.isArray(rules) ? rules : [];

      const rule = safeRules.find(
        (rule) => Number(rule.id) === Number(systemRuleId),
      );
      setSelectedRule(rule || null);
    } else {
      setSelectedRule(null);
    }
  }, [systemRuleId, rules]);

  const durationLabel = useMemo(() => {
    if (!startDate || !endDate) return "Chưa chọn thời gian";
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Thời gian không hợp lệ";
    }
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return `${days} ngày thi đấu`;
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên mùa giải.");
      return;
    }
    if (!year.trim()) {
      setErrorMsg("Vui lòng nhập năm mùa giải.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    if (!systemRuleId) {
      setErrorMsg("Bắt buộc phải chọn bộ luật áp dụng.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      year: year.trim(),
      startDate,
      endDate,
      leagueId,
      systemRuleId: Number(systemRuleId),
    };

    try {
      if (currentSeason?.id) {
        await SeasonService.updateSeason(currentSeason.id, payload);
      } else {
        await SeasonService.addSeason(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-[#F5F3EF]">
      <div className="relative overflow-hidden border-b border-[#E4E2DE] bg-white px-7 py-6">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#B2F746]/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#707A6C]">
              Season setup
            </p>
            <h1 className="font-['Be_Vietnam_Pro'] text-2xl font-black text-[#1B1C1A]">
              {isEditMode ? "Cập nhật mùa giải" : "Thêm mùa giải mới"}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#707A6C]">
              Cấu hình mùa giải thuộc League hiện tại và gán bộ luật áp dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F0EEEA] p-2 text-[#707A6C] transition hover:bg-[#E4E2DE] hover:text-[#1B1C1A]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7">
        {errorMsg && (
          <div className="mb-6 rounded-[1.25rem] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-5 lg:col-span-7">
            <div className="rounded-[1.75rem] border border-[#E4E2DE] bg-white p-6 shadow-[0_8px_24px_rgba(0,73,14,0.05)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D631B]/10 text-[#0D631B]">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B1C1A]">
                    Thông tin mùa giải
                  </h3>
                  <p className="text-xs font-medium text-[#707A6C]">
                    Season luôn thuộc về League đang chọn.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <InputField
                  label="Tên mùa giải"
                  value={name}
                  onChange={setName}
                  placeholder="V.League 1 2026/2027"
                  required
                />

                <InputField
                  label="Năm mùa giải"
                  value={year}
                  onChange={setYear}
                  placeholder="2026/2027"
                  required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DateField
                    label="Ngày bắt đầu"
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <DateField
                    label="Ngày kết thúc"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#707A6C]">
                    Bộ luật áp dụng <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={systemRuleId}
                    onChange={(e) =>
                      setSystemRuleId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    required
                    className="w-full appearance-none rounded-[1rem] border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-[#1B1C1A] outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
                  >
                    <option value="">-- Chọn bộ luật --</option>
                    {(Array.isArray(rules) ? rules : []).map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.ruleName?.trim() || `Bộ luật #${rule.id}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MiniStat icon="timer" label="Thời lượng" value={durationLabel} />
              <MiniStat
                icon="policy"
                label="Bộ luật"
                value={selectedRule?.ruleName || "Chưa chọn"}
              />
              <MiniStat
                icon="trophy"
                label="League ID"
                value={`#${leagueId || "N/A"}`}
              />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="sticky top-0 flex max-h-[70vh] flex-col rounded-[1.75rem] border border-[#E4E2DE] bg-white p-6 shadow-[0_8px_24px_rgba(0,73,14,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#E4E2DE] pb-4">
                <div>
                  <h3 className="text-base font-black text-[#1B1C1A]">
                    Preview bộ luật
                  </h3>
                  <p className="text-xs font-medium text-[#707A6C]">
                    Các giới hạn nghiệp vụ sẽ áp dụng cho mùa giải.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#0D631B]">
                  gavel
                </span>
              </div>

              {selectedRule ? (
                <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm text-[#40493D]">
                  <div className="rounded-[1.25rem] bg-[#0D631B] p-4 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black">
                          {selectedRule.ruleName}
                        </p>
                        {selectedRule.description && (
                          <p className="mt-1 text-xs leading-5 text-white/75">
                            {selectedRule.description}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                        {selectedRule.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <RuleMetric
                      label="Số đội tối đa"
                      value={selectedRule.maxTeams}
                    />
                    <RuleMetric
                      label="Độ tuổi"
                      value={
                        selectedRule.minAge && selectedRule.maxAge
                          ? `${selectedRule.minAge} - ${selectedRule.maxAge}`
                          : undefined
                      }
                    />
                    <RuleMetric
                      label="Cầu thủ min/max"
                      value={
                        selectedRule.minPlayers && selectedRule.maxPlayers
                          ? `${selectedRule.minPlayers} - ${selectedRule.maxPlayers}`
                          : undefined
                      }
                    />
                    <RuleMetric
                      label="Đăng ký tối thiểu"
                      value={selectedRule.minRegistrationPlayers}
                    />
                    <RuleMetric
                      label="Ngoại binh tối đa"
                      value={selectedRule.maxForeignPlayers}
                    />
                    <RuleMetric
                      label="Thay người tối đa"
                      value={selectedRule.maxSubstitution}
                    />
                    <RuleMetric
                      label="Điểm thắng/hòa/thua"
                      value={`${selectedRule.winPoints ?? 3} / ${
                        selectedRule.drawPoints ?? 1
                      } / ${selectedRule.losePoints ?? 0}`}
                    />
                    <RuleMetric
                      label="Loại bàn thắng"
                      value={selectedRule.allowedGoalTypes || "Chưa cấu hình"}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[#BFCABA] bg-[#F5F3EF] py-12 text-center text-[#707A6C]">
                  <span className="material-symbols-outlined mb-3 text-5xl text-[#0D631B]">
                    find_in_page
                  </span>
                  <p className="text-sm font-black">Chưa chọn bộ luật</p>
                  <p className="mt-1 max-w-xs text-xs leading-5">
                    Chọn một bộ luật ACTIVE để xem nhanh các cấu hình điều hành
                    mùa giải.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E4E2DE] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#E4E2DE] px-6 py-3 text-sm font-black text-[#40493D] transition hover:bg-[#DAD8D4]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !systemRuleId}
            className="rounded-full bg-[#0D631B] px-7 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#00490E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Đang lưu..."
              : isEditMode
                ? "Cập nhật"
                : "Tạo mùa giải"}
          </button>
        </div>
      </form>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#707A6C]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[1rem] border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-[#1B1C1A] outline-none transition placeholder:text-[#707A6C]/60 focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#707A6C]">
        {label} <span className="text-red-500">*</span>
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-[1rem] border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-[#1B1C1A] outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
      />
    </label>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#E4E2DE] bg-white p-4 shadow-sm">
      <span className="material-symbols-outlined text-[#0D631B]">{icon}</span>
      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-black text-[#1B1C1A]">
        {value}
      </p>
    </div>
  );
}

function RuleMetric({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-[1rem] bg-[#F5F3EF] p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[#1B1C1A]">
        {value ?? "Chưa cấu hình"}
      </p>
    </div>
  );
}
