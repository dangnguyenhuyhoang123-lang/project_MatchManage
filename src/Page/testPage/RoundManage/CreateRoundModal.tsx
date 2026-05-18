import React, { useEffect, useMemo, useState } from "react";
import { RoundModel } from "../../../model/RoundModel";
import { SeasonModel } from "../../../model/SeasonModel";
import RoundService from "../../../services/RoundService";
import SeasonService from "../../../services/SeasonService";

interface Props {
  onClose: () => void;
  currentRound?: RoundModel | null;
  onSuccess: () => void;
}

const createEmptyRound = () =>
  new RoundModel({
    roundNumber: 1,
    name: "",
    startDate: "",
    endDate: "",
    maxMatches: 7,
    status: "SCHEDULED",
    notifyTeams: true,
    seasonId: null,
    seasonName: null,
  });

const toDateTimeLocal = (value: string) => {
  if (!value) return "";
  return value.slice(0, 16);
};

export default function CreateRoundModal({
  onClose,
  currentRound,
  onSuccess,
}: Props) {
  const [round, setRound] = useState<RoundModel>(createEmptyRound());
  const [seasons, setSeasons] = useState<SeasonModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = useMemo(() => Boolean(currentRound?.id), [currentRound]);

  useEffect(() => {
    setRound(currentRound ? new RoundModel(currentRound) : createEmptyRound());
  }, [currentRound]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await SeasonService.getAllSeasons(0, 1000);
        const rawSeasons = Array.isArray(response.data)
          ? response.data
          : response.data?.content ?? [];

        setSeasons(
          rawSeasons.map(
            (season: any) =>
              new SeasonModel({
                id: season.id,
                year: season.year ?? season.name ?? "",
              }),
          ),
        );
      } catch (error) {
        console.error("Lỗi khi tải mùa giải:", error);
        setSeasons([]);
      }
    };

    fetchSeasons();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setRound((prev) => {
      const next = new RoundModel(prev);

      if (type === "checkbox") {
        next.notifyTeams = (e.target as HTMLInputElement).checked;
        return next;
      }

      if (name === "roundNumber" || name === "maxMatches") {
        (next as unknown as Record<string, unknown>)[name] = Number(value);
        return next;
      }

      if (name === "seasonId") {
        const parsedSeasonId = value ? Number(value) : null;
        next.seasonId = parsedSeasonId;
        next.seasonName =
          seasons.find((season) => season.id === parsedSeasonId)?.year ?? null;
        return next;
      }

      (next as unknown as Record<string, unknown>)[name] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!round.name.trim()) {
      alert("Vui lòng nhập tên vòng đấu.");
      return;
    }

    if (!round.startDate || !round.endDate) {
      alert("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }

    if (!round.seasonId) {
      alert("Vui lòng chọn mùa giải.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (round.id) {
        await RoundService.updateRound(round.id, round);
      } else {
        await RoundService.addRound(round);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu vòng đấu:", error);
      alert("Có lỗi xảy ra khi lưu vòng đấu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fbf9f5] shadow-2xl">
      <div className="p-6 md:p-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight">
              {isEditMode ? "Cập nhật vòng đấu" : "Thiết lập vòng đấu mới"}
            </h1>
            <p className="text-sm text-[#707a6c]">
              Cấu hình thông số và lịch trình cho vòng đấu đồng bộ với API.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="grid grid-cols-1 gap-8 lg:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-3xl border border-[#bfcaba]/30 bg-white p-8 shadow-[0_12px_48px_-12px_rgba(27,28,26,0.06)]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  id="round-name"
                  label="Tên vòng đấu"
                  name="name"
                  value={round.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Vòng 1"
                />

                <SelectField
                  id="season"
                  label="Mùa giải"
                  name="seasonId"
                  value={round.seasonId ? String(round.seasonId) : ""}
                  onChange={handleChange}
                  options={seasons.map((season) => ({
                    value: String(season.id),
                    label: season.year,
                  }))}
                  placeholder="Chọn mùa giải"
                />

                <InputField
                  id="round-number"
                  label="Số thứ tự vòng"
                  name="roundNumber"
                  type="number"
                  value={round.roundNumber}
                  onChange={handleChange}
                />

                <SelectField
                  id="status"
                  label="Trạng thái"
                  name="status"
                  value={round.status}
                  onChange={handleChange}
                  options={[
                    { value: "SCHEDULED", label: "Đã lên lịch" },
                    { value: "ONGOING", label: "Đang diễn ra" },
                    { value: "COMPLETED", label: "Đã hoàn thành" },
                  ]}
                />

                <InputField
                  id="start-date"
                  label="Thời gian bắt đầu dự kiến"
                  name="startDate"
                  type="datetime-local"
                  value={toDateTimeLocal(round.startDate)}
                  onChange={handleChange}
                />

                <InputField
                  id="end-date"
                  label="Thời gian kết thúc dự kiến"
                  name="endDate"
                  type="datetime-local"
                  value={toDateTimeLocal(round.endDate)}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[#bfcaba]/30 bg-[#f5f3ef] p-8">
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#959efd] text-[#27308a] shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1b1c1a]">Lưu ý quản lý</h3>
                  <p className="mt-0.5 text-xs text-[#707a6c]">
                    Hệ thống sẽ tự động gửi thông báo cho các đội nếu bạn bật tùy chọn bên dưới.
                  </p>
                </div>
              </div>

              <label className="group relative z-10 flex cursor-pointer items-start gap-3 pl-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="notifyTeams"
                    checked={round.notifyTeams}
                    onChange={handleChange}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[#bfcaba] transition-all checked:border-[#0d631b] checked:bg-[#0d631b]"
                  />
                  <span className="material-symbols-outlined pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100">
                    check
                  </span>
                </div>
                <span className="mt-0.5 text-sm font-medium text-[#40493d] transition-colors group-hover:text-[#1b1c1a]">
                  Gửi email thông báo lịch thi đấu cho các đội trưởng ngay sau khi lưu.
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="flex flex-col items-center rounded-3xl border border-[#bfcaba]/30 bg-white p-8 text-center shadow-[0_12px_48px_-12px_rgba(27,28,26,0.06)]">
              <div className="mb-4 flex h-16 w-16 -rotate-3 items-center justify-center rounded-2xl bg-[#a3f69c] shadow-sm">
                <span className="material-symbols-outlined rotate-3 text-[32px] text-[#002204]">
                  sports
                </span>
              </div>
              <label htmlFor="max-matches" className="mb-2 text-base font-black text-[#1b1c1a]">
                Số trận tối đa
              </label>
              <p className="mb-8 px-2 text-xs leading-relaxed text-[#707a6c]">
                Tổng số trận đấu có thể tổ chức trong vòng này dựa trên sân bãi khả dụng.
              </p>

              <input
                id="max-matches"
                type="number"
                name="maxMatches"
                value={round.maxMatches}
                onChange={handleChange}
                className="w-full rounded-full border border-[#bfcaba]/20 bg-[#fbf9f5] px-6 py-4 text-center text-3xl font-black text-[#0d631b] outline-none"
              />
            </div>

            <div className="group relative flex h-[180px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d622b] to-[#0d631b] p-6 shadow-md">
              <div className="absolute inset-0 scale-150 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-20"></div>

              <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-1">
                <h4 className="mb-2 text-xl font-black leading-tight text-white">
                  Mật độ lịch thi đấu
                </h4>
                <p className="text-xs font-medium leading-relaxed text-[#cbffc2]/90">
                  Vòng đấu này dự kiến tổ chức tối đa {round.maxMatches} trận từ{" "}
                  {round.startDate ? "mốc bắt đầu đã chọn" : "thời điểm bạn cấu hình"}.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#0d631b] py-4 font-bold text-white shadow-lg shadow-[#0d631b]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0a4a14] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">
                  save
                </span>
                {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-transparent py-4 font-bold text-[#707a6c] transition-colors hover:bg-[#eae8e4]/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
                Hủy bỏ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

type InputFieldProps = {
  id: string;
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
};

const InputField = ({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: InputFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="px-1 text-sm font-bold text-[#40493d]">
      {label}
    </label>
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="rounded-xl border border-transparent bg-[#eae8e4]/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-[#707a6c]/50 focus:border-[#0d631b]/50 focus:bg-white focus:ring-4 focus:ring-[#0d631b]/10"
      type={type}
    />
  </div>
);

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
};

const SelectField = ({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: SelectFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="px-1 text-sm font-bold text-[#40493d]">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-[#eae8e4]/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#0d631b]/50 focus:bg-white focus:ring-4 focus:ring-[#0d631b]/10"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#707a6c]">
        expand_more
      </span>
    </div>
  </div>
);
