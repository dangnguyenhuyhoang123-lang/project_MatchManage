import React, { useEffect, useMemo, useState } from "react";
import SystemRuleService, {
  type SystemRule,
  type SystemRulePayload,
} from "../../../services/SystemRuleService";

type FormState = {
  ruleName: string;
  description: string;
  maxTeams: string;
  minAge: string;
  maxAge: string;
  minPlayers: string;
  maxPlayers: string;
  winPoints: string;
  drawPoints: string;
  losePoints: string;
  maxSubstitution: string;
  minRegistrationPlayers: string;
  maxForeignPlayers: string;
  maxForeignPlayersOnField: string;
  maxGoalMinute: string;
  status: "ACTIVE" | "INACTIVE";
  allowedGoalTypes: string[];
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const goalTypeOptions = [
  { value: "NORMAL", label: "Bàn thắng thường" },
  { value: "PENALTY", label: "Penalty" },
  { value: "OWN_GOAL", label: "Phản lưới nhà" },
];

const emptyForm: FormState = {
  ruleName: "",
  description: "",
  maxTeams: "",
  minAge: "",
  maxAge: "",
  minPlayers: "",
  maxPlayers: "",
  winPoints: "3",
  drawPoints: "1",
  losePoints: "0",
  maxSubstitution: "5",
  minRegistrationPlayers: "",
  maxForeignPlayers: "0",
  maxForeignPlayersOnField: "0",
  maxGoalMinute: "90",
  status: "ACTIVE",
  allowedGoalTypes: ["NORMAL", "PENALTY", "OWN_GOAL"],
};

function toInputValue(value: number | null) {
  return value == null ? "" : String(value);
}

function toNullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseGoalTypes(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFormFromRule(rule: SystemRule): FormState {
  return {
    ruleName: rule.ruleName,
    description: rule.description ?? "",
    maxTeams: toInputValue(rule.maxTeams),
    minAge: toInputValue(rule.minAge),
    maxAge: toInputValue(rule.maxAge),
    minPlayers: toInputValue(rule.minPlayers),
    maxPlayers: toInputValue(rule.maxPlayers),
    winPoints: toInputValue(rule.winPoints),
    drawPoints: toInputValue(rule.drawPoints),
    losePoints: toInputValue(rule.losePoints),
    maxSubstitution: toInputValue(rule.maxSubstitution),
    minRegistrationPlayers: toInputValue(rule.minRegistrationPlayers),
    maxForeignPlayers: toInputValue(rule.maxForeignPlayers),
    maxForeignPlayersOnField: toInputValue(rule.maxForeignPlayersOnField),
    maxGoalMinute: toInputValue(rule.maxGoalMinute),
    status: rule.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    allowedGoalTypes: parseGoalTypes(rule.allowedGoalTypes),
  };
}

function buildPayload(form: FormState): SystemRulePayload {
  return {
    ruleName: form.ruleName.trim(),
    description: form.description.trim() || null,
    maxTeams: toNullableNumber(form.maxTeams),
    minAge: toNullableNumber(form.minAge),
    maxAge: toNullableNumber(form.maxAge),
    minPlayers: toNullableNumber(form.minPlayers),
    maxPlayers: toNullableNumber(form.maxPlayers),
    winPoints: toNullableNumber(form.winPoints),
    drawPoints: toNullableNumber(form.drawPoints),
    losePoints: toNullableNumber(form.losePoints),
    maxSubstitution: toNullableNumber(form.maxSubstitution),
    minRegistrationPlayers: toNullableNumber(form.minRegistrationPlayers),
    maxForeignPlayers: toNullableNumber(form.maxForeignPlayers),
    maxForeignPlayersOnField: toNullableNumber(form.maxForeignPlayersOnField),
    maxGoalMinute: toNullableNumber(form.maxGoalMinute),
    status: form.status,
    allowedGoalTypes: form.allowedGoalTypes.join(",") || null,
  };
}

function validateForm(form: FormState) {
  const errors: FormErrors = {};
  const maxTeams = Number(form.maxTeams);
  const minAge = Number(form.minAge);
  const maxAge = Number(form.maxAge);
  const minPlayers = Number(form.minPlayers);
  const maxPlayers = Number(form.maxPlayers);
  const winPoints = Number(form.winPoints);
  const drawPoints = Number(form.drawPoints);
  const losePoints = Number(form.losePoints);
  const maxSubstitution = Number(form.maxSubstitution);
  const maxForeignPlayers = Number(form.maxForeignPlayers);
  const maxForeignPlayersOnField = Number(form.maxForeignPlayersOnField);
  const maxGoalMinute = Number(form.maxGoalMinute);
  const minRegistrationPlayers = Number(form.minRegistrationPlayers);

  if (!form.ruleName.trim()) {
    errors.ruleName = "Tên bộ luật không được để trống.";
  }

  if (!Number.isFinite(maxTeams) || maxTeams <= 0) {
    errors.maxTeams = "Số đội tối đa phải lớn hơn 0.";
  }

  if (form.minAge && form.maxAge && minAge > maxAge) {
    errors.maxAge = "Tuổi tối đa phải lớn hơn hoặc bằng tuổi tối thiểu.";
  }

  if (form.minPlayers && form.maxPlayers && minPlayers > maxPlayers) {
    errors.maxPlayers =
      "Số cầu thủ tối đa phải lớn hơn hoặc bằng số cầu thủ tối thiểu.";
  }

  if (
    form.minRegistrationPlayers &&
    form.maxPlayers &&
    minRegistrationPlayers > maxPlayers
  ) {
    errors.minRegistrationPlayers =
      "Số cầu thủ đăng ký tối thiểu không được lớn hơn số cầu thủ tối đa.";
  }

  if (
    form.maxForeignPlayers &&
    form.maxPlayers &&
    maxForeignPlayers > maxPlayers
  ) {
    errors.maxForeignPlayers =
      "Số ngoại binh tối đa không được vượt quá số cầu thủ tối đa.";
  }

  if (
    !Number.isFinite(winPoints) ||
    !Number.isFinite(drawPoints) ||
    !Number.isFinite(losePoints) ||
    winPoints <= drawPoints ||
    drawPoints <= losePoints
  ) {
    errors.winPoints = "Điểm thắng phải lớn hơn điểm hòa.";
  }

  if (form.losePoints && (!Number.isFinite(losePoints) || losePoints < 0)) {
    errors.losePoints = "Điểm thua phải lớn hơn hoặc bằng 0.";
  }

  if (!Number.isFinite(maxSubstitution) || maxSubstitution < 0) {
    errors.maxSubstitution = "Số lượt thay người phải lớn hơn hoặc bằng 0.";
  }

  if (
    form.maxForeignPlayersOnField &&
    (!Number.isFinite(maxForeignPlayersOnField) ||
      maxForeignPlayersOnField < 0 ||
      maxForeignPlayersOnField > maxForeignPlayers)
  ) {
    errors.maxForeignPlayersOnField =
      "Số ngoại binh trên sân không được vượt quá số ngoại binh tối đa.";
  }

  if (!Number.isFinite(maxGoalMinute) || maxGoalMinute <= 0) {
    errors.maxGoalMinute = "Phút tối đa ghi bàn phải lớn hơn 0.";
  }

  return errors;
}

function formatRange(from: number | null, to: number | null, suffix = "") {
  if (from == null && to == null) return "Chưa cấu hình";
  if (from == null) return `Tối đa ${to}${suffix}`;
  if (to == null) return `Tối thiểu ${from}${suffix}`;
  return `${from} - ${to}${suffix}`;
}

function formatValue(value: number | null, fallback = "Chưa cấu hình") {
  return value == null ? fallback : String(value);
}

function goalTypeLabel(value: string) {
  return goalTypeOptions.find((item) => item.value === value)?.label ?? value;
}

const SystemRulesPage: React.FC = () => {
  const [rules, setRules] = useState<SystemRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SystemRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(() => {
    const activeCount = rules.filter((rule) => rule.status === "ACTIVE").length;
    const inactiveCount = rules.filter(
      (rule) => rule.status !== "ACTIVE",
    ).length;

    return {
      total: rules.length,
      active: activeCount,
      inactive: inactiveCount,
    };
  }, [rules]);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);

        const response = await SystemRuleService.getAll();
        const rules = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.content)
            ? response.data.content
            : [];

        setRules(rules);
      } catch (error) {
        console.error("Cannot load system rules", error);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const openCreateModal = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (rule: SystemRule) => {
    setEditingRule(rule);
    setForm(buildFormFromRule(rule));
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingRule(null);
    setForm(emptyForm);
    setErrors({});
  };

  const updateField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const toggleGoalType = (goalType: string) => {
    setForm((prev) => {
      const exists = prev.allowedGoalTypes.includes(goalType);

      return {
        ...prev,
        allowedGoalTypes: exists
          ? prev.allowedGoalTypes.filter((item) => item !== goalType)
          : [...prev.allowedGoalTypes, goalType],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = buildPayload(form);

    try {
      setSubmitting(true);

      if (editingRule) {
        const response = await SystemRuleService.update(
          editingRule.id,
          payload,
        );
        const updatedRule = response.data ?? response;
        setRules((prev) =>
          prev.map((rule) => (rule.id === editingRule.id ? updatedRule : rule)),
        );
      } else {
        const response = await SystemRuleService.create(payload);
        const createdRule = response.data ?? response;

        setRules((prev) => [createdRule, ...prev]);
      }

      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rule: SystemRule) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ luật "${rule.ruleName}"?`,
    );

    if (!confirmed) return;

    try {
      await SystemRuleService.delete(rule.id);
      setRules((prev) => prev.filter((item) => item.id !== rule.id));
    } catch (error: any) {
      console.error("Lỗi khi xóa bộ luật:", error);
      const apiMsg = String(
        error?.response?.data?.message || error?.response?.data || "",
      );
      if (
        apiMsg.includes("season") ||
        apiMsg.includes("Season") ||
        apiMsg.includes("foreign key") ||
        apiMsg.includes("constraint") ||
        error?.response?.status === 409 ||
        error?.response?.status === 500
      ) {
        alert(
          `Không thể xóa bộ luật "${rule.ruleName}" vì nó đang được sử dụng bởi một hoặc nhiều mùa giải. Gợi ý: Bạn có thể chuyển trạng thái của bộ luật này sang INACTIVE để ngưng áp dụng thay vì xóa.`,
        );
      } else {
        alert(
          "Không thể xóa bộ luật này. Vui lòng kiểm tra xem nó có đang được liên kết với mùa giải nào không.",
        );
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F3EF] px-4 py-8 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
              System rules
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Cấu hình luật giải đấu
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-600">
              Quản lý các bộ luật có thể áp dụng cho từng mùa giải.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0D631B] px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-[#008C2F]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm bộ luật
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            icon="rule"
            label="Tổng số bộ luật"
            value={stats.total}
            tone="bg-green-50 text-[#0D631B]"
          />
          <StatCard
            icon="verified"
            label="Đang hoạt động"
            value={stats.active}
            tone="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            icon="pause_circle"
            label="Tạm ngưng"
            value={stats.inactive}
            tone="bg-amber-50 text-amber-700"
          />
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-gray-100 md:p-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Danh sách bộ luật</h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Theo dõi và cập nhật nhanh các tham số vận hành mùa giải.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-gray-500">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#0D631B]">
                progress_activity
              </span>
              <p className="text-sm font-bold">Đang tải danh sách bộ luật...</p>
            </div>
          ) : rules.length === 0 ? (
            <EmptyState onCreate={openCreateModal} />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={() => openEditModal(rule)}
                  onDelete={() => handleDelete(rule)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <RuleModal
          form={form}
          errors={errors}
          submitting={submitting}
          isEdit={Boolean(editingRule)}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onFieldChange={updateField}
          onToggleGoalType={toggleGoalType}
        />
      )}
    </main>
  );
};

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
          Rules
        </span>
      </div>
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-gray-500">{label}</p>
    </article>
  );
}

function RuleCard({
  rule,
  onEdit,
  onDelete,
}: {
  rule: SystemRule;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const goalTypes = parseGoalTypes(rule.allowedGoalTypes);

  return (
    <article className="flex flex-col gap-6 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-gray-950">
              {rule.ruleName}
            </h3>
            <StatusBadge status={rule.status} />
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-gray-500">
            {rule.description || "Chưa có mô tả cho bộ luật này."}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-[#0D631B] transition hover:bg-green-100"
            aria-label="Sửa bộ luật"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Xóa bộ luật"
          >
            <span className="material-symbols-outlined text-[20px]">
              delete
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoItem
          icon="groups"
          label="Số đội tối đa"
          value={formatValue(rule.maxTeams)}
        />
        <InfoItem
          icon="cake"
          label="Độ tuổi hợp lệ"
          value={formatRange(rule.minAge, rule.maxAge, " tuổi")}
        />
        <InfoItem
          icon="sports_soccer"
          label="Cầu thủ tối thiểu/tối đa"
          value={formatRange(rule.minPlayers, rule.maxPlayers)}
        />
        <InfoItem
          icon="scoreboard"
          label="Điểm thắng/hòa/thua"
          value={`${formatValue(rule.winPoints, "-")} / ${formatValue(
            rule.drawPoints,
            "-",
          )} / ${formatValue(rule.losePoints, "-")}`}
        />
        <InfoItem
          icon="sync_alt"
          label="Thay người tối đa"
          value={formatValue(rule.maxSubstitution)}
        />
        <InfoItem
          icon="public"
          label="Ngoại binh tối đa"
          value={formatValue(rule.maxForeignPlayers)}
        />
        <InfoItem
          icon="sports"
          label="Ngoại binh tối đa trên sân"
          value={formatValue(rule.maxForeignPlayersOnField)}
        />
        <InfoItem
          icon="timer"
          label="Phút tối đa ghi bàn"
          value={formatValue(rule.maxGoalMinute)}
        />
        <InfoItem
          icon="assignment"
          label="Cầu thủ đăng ký tối thiểu"
          value={formatValue(rule.minRegistrationPlayers)}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">
          Loại bàn thắng cho phép
        </p>
        <div className="flex flex-wrap gap-2">
          {goalTypes.length > 0 ? (
            goalTypes.map((goalType) => (
              <span
                key={goalType}
                className="rounded-full bg-[#F5F3EF] px-3 py-1 text-xs font-bold text-gray-700"
              >
                {goalTypeLabel(goalType)}
              </span>
            ))
          ) : (
            <span className="text-sm font-semibold text-gray-400">
              Chưa cấu hình
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
        isActive ? "bg-green-50 text-[#0D631B]" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F5F3EF] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-400">
        <span className="material-symbols-outlined text-[18px] text-[#0D631B]">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-sm font-black text-gray-900">{value}</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-gray-200 bg-[#F5F3EF]/50 p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#0D631B]">
        <span className="material-symbols-outlined text-3xl">rule</span>
      </div>
      <h3 className="text-xl font-black">Chưa có bộ luật nào</h3>
      <p className="mt-2 max-w-md text-sm font-medium text-gray-500">
        Tạo bộ luật đầu tiên để cấu hình điều kiện đăng ký, điểm số và quy định
        vận hành mùa giải.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 rounded-full bg-[#0D631B] px-6 py-3 text-sm font-black text-white transition hover:bg-[#008C2F]"
      >
        Thêm bộ luật
      </button>
    </div>
  );
}

function RuleModal({
  form,
  errors,
  submitting,
  isEdit,
  onClose,
  onSubmit,
  onFieldChange,
  onToggleGoalType,
}: {
  form: FormState;
  errors: FormErrors;
  submitting: boolean;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFieldChange: (name: keyof FormState, value: string) => void;
  onToggleGoalType: (goalType: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#008C2F]">
              {isEdit ? "Edit rule" : "New rule"}
            </p>
            <h2 className="text-2xl font-black">
              {isEdit ? "Cập nhật bộ luật" : "Thêm bộ luật"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label="Tên bộ luật"
              value={form.ruleName}
              error={errors.ruleName}
              onChange={(value) => onFieldChange("ruleName", value)}
              required
            />
            <SelectField
              label="Trạng thái"
              value={form.status}
              onChange={(value) =>
                onFieldChange("status", value as FormState["status"])
              }
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
              ]}
            />

            <TextAreaField
              label="Mô tả"
              value={form.description}
              onChange={(value) => onFieldChange("description", value)}
            />

            <div className="rounded-2xl bg-[#F5F3EF] p-4">
              <p className="mb-3 text-sm font-black text-gray-900">
                Loại bàn thắng cho phép
              </p>
              <div className="space-y-3">
                {goalTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.allowedGoalTypes.includes(option.value)}
                      onChange={() => onToggleGoalType(option.value)}
                      className="h-4 w-4 accent-[#0D631B]"
                    />
                    <span>{option.label}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {option.value}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <NumberField
              label="Số đội tối đa"
              value={form.maxTeams}
              error={errors.maxTeams}
              onChange={(value) => onFieldChange("maxTeams", value)}
            />
            <NumberField
              label="Tuổi tối thiểu"
              value={form.minAge}
              onChange={(value) => onFieldChange("minAge", value)}
            />
            <NumberField
              label="Tuổi tối đa"
              value={form.maxAge}
              error={errors.maxAge}
              onChange={(value) => onFieldChange("maxAge", value)}
            />
            <NumberField
              label="Cầu thủ tối thiểu"
              value={form.minPlayers}
              onChange={(value) => onFieldChange("minPlayers", value)}
            />
            <NumberField
              label="Cầu thủ tối đa"
              value={form.maxPlayers}
              error={errors.maxPlayers}
              onChange={(value) => onFieldChange("maxPlayers", value)}
            />
            <NumberField
              label="Điểm thắng"
              value={form.winPoints}
              error={errors.winPoints}
              onChange={(value) => onFieldChange("winPoints", value)}
            />
            <NumberField
              label="Điểm hòa"
              value={form.drawPoints}
              onChange={(value) => onFieldChange("drawPoints", value)}
            />
            <NumberField
              label="Điểm thua"
              value={form.losePoints}
              onChange={(value) => onFieldChange("losePoints", value)}
            />
            <NumberField
              label="Thay người tối đa"
              value={form.maxSubstitution}
              error={errors.maxSubstitution}
              onChange={(value) => onFieldChange("maxSubstitution", value)}
            />
            <NumberField
              label="Cầu thủ đăng ký tối thiểu"
              value={form.minRegistrationPlayers}
              onChange={(value) =>
                onFieldChange("minRegistrationPlayers", value)
              }
            />
            <NumberField
              label="Ngoại binh tối đa"
              value={form.maxForeignPlayers}
              error={errors.maxForeignPlayers}
              onChange={(value) => onFieldChange("maxForeignPlayers", value)}
            />
            <NumberField
              label="Số ngoại binh tối đa trên sân"
              value={form.maxForeignPlayersOnField}
              error={errors.maxForeignPlayersOnField}
              onChange={(value) =>
                onFieldChange("maxForeignPlayersOnField", value)
              }
            />

            <NumberField
              label="Phút tối đa ghi bàn"
              value={form.maxGoalMinute}
              error={errors.maxGoalMinute}
              onChange={(value) => onFieldChange("maxGoalMinute", value)}
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full px-6 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D631B] px-7 py-3 text-sm font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-[#008C2F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              )}
              Lưu bộ luật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  error,
  onChange,
  required,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-gray-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-[#0D631B]/20 ${
          error ? "border-red-300" : "border-transparent"
        }`}
      />
      {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
    </label>
  );
}

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-gray-800">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-[#0D631B]/20 ${
          error ? "border-red-300" : "border-transparent"
        }`}
      />
      {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
    </label>
  );
}

function TextAreaField({
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
      <span className="mb-2 block text-sm font-black text-gray-800">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-2xl border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-[#0D631B]/20"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-gray-800">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-[#0D631B]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SystemRulesPage;
