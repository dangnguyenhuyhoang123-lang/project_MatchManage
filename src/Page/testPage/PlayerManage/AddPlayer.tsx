import React, { useEffect, useMemo, useState } from "react";
import { Player } from "../../../model/Player";
import PlayerService from "../../../services/PlayerService";
import TeamService from "../../../services/TeamService";

type TeamOption = {
  id: number;
  name: string;
};

interface Props {
  onClose: () => void;
  currentPlayer?: Player | null;
  onSuccess: () => void;
}

const createEmptyPlayer = () =>
  new Player({
    name: "",
    idCode: null,
    dateOfBirth: "",
    position: "GK",
    detailPosition: null,
    shirtNumber: 0,
    nationality: "Việt Nam",
    height: 170,
    weight: 65,
    status: "ACTIVE",
    avatar: null,
    teamId: null,
    teamName: null,
  });

export const AddPlayerModal: React.FC<Props> = ({
  onClose,
  currentPlayer,
  onSuccess,
}) => {
  const [player, setPlayer] = useState<Player>(createEmptyPlayer());
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = useMemo(() => Boolean(currentPlayer?.id), [currentPlayer]);

  useEffect(() => {
    setPlayer(currentPlayer ? new Player(currentPlayer) : createEmptyPlayer());
  }, [currentPlayer]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await TeamService.getAllTeams(0, 1000);
        const rawTeams = Array.isArray(response.data)
          ? response.data
          : response.data?.content ?? [];

        setTeamOptions(
          rawTeams
            .map((team: any) => ({
              id: Number(team.id),
              name: team.name,
            }))
            .filter((team: TeamOption) => Number.isFinite(team.id) && team.name),
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách đội:", error);
        setTeamOptions([]);
      }
    };

    fetchTeams();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setPlayer((prev) => {
      const next = new Player(prev);

      if (name === "shirtNumber" || name === "height" || name === "weight") {
        (next as unknown as Record<string, unknown>)[name] = Number(value);
        return next;
      }

      if (name === "teamId") {
        const parsedTeamId = value ? Number(value) : null;
        next.teamId = parsedTeamId;
        next.teamName =
          teamOptions.find((team) => team.id === parsedTeamId)?.name ?? null;
        return next;
      }

      (next as unknown as Record<string, unknown>)[name] = value || null;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!player.name.trim()) {
      alert("Vui lòng nhập tên cầu thủ.");
      return;
    }

    if (!player.dateOfBirth) {
      alert("Vui lòng chọn ngày sinh.");
      return;
    }

    if (!player.position) {
      alert("Vui lòng chọn vị trí.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (player.id) {
        await PlayerService.updatePlayer(player.id, player);
      } else {
        await PlayerService.addPlayer(player);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu cầu thủ:", error);
      alert("Có lỗi xảy ra khi lưu cầu thủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-[#fbf9f5] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-[#fbf9f5] px-8 py-4">
          <h2 className="text-xl font-black font-['Be_Vietnam_Pro']">
            {isEditMode ? "Cập nhật cầu thủ" : "Thêm cầu thủ mới"}
          </h2>
          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-4">
              <div className="flex flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-sm">
                <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-[#f5f3ef] shadow-md">
                  <img
                    src={player.avatar || "https://via.placeholder.com/300x300?text=Player"}
                    className="h-full w-full object-cover"
                    alt={player.name || "player"}
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold">Ảnh đại diện</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Nhập URL ảnh ở phần thông tin bổ sung để hiển thị ảnh thật.
                </p>
              </div>

              <div className="rounded-2xl bg-[#2e7d32] p-6 text-white">
                <h4 className="mb-4 font-bold">Thể trạng hiện tại</h4>
                <div className="flex justify-between">
                  <StatItem label="Chiều cao" value={`${player.height} cm`} />
                  <StatItem label="Cân nặng" value={`${player.weight} kg`} />
                  <StatItem
                    label="Số áo"
                    value={player.shirtNumber ? String(player.shirtNumber) : "--"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-8">
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-xl font-bold">Thông tin cơ bản</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <InputField
                    label="Họ tên cầu thủ"
                    name="name"
                    value={player.name}
                    onChange={handleChange}
                  />
                  <InputField
                    label="CCCD / Mã định danh"
                    name="idCode"
                    value={player.idCode ?? ""}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={player.dateOfBirth}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Quốc tịch"
                    name="nationality"
                    value={player.nationality}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Vị trí"
                    name="position"
                    value={player.position}
                    options={[
                      { value: "GK", label: "Thủ môn (GK)" },
                      { value: "DF", label: "Hậu vệ (DF)" },
                      { value: "MF", label: "Tiền vệ (MF)" },
                      { value: "FW", label: "Tiền đạo (FW)" },
                    ]}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Vị trí chi tiết"
                    name="detailPosition"
                    value={player.detailPosition ?? ""}
                    onChange={handleChange}
                    placeholder="Ví dụ: Trung vệ, Cánh trái..."
                  />
                  <InputField
                    label="Số áo"
                    name="shirtNumber"
                    type="number"
                    value={player.shirtNumber}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Trạng thái"
                    name="status"
                    value={player.status}
                    options={[
                      { value: "ACTIVE", label: "Đang thi đấu" },
                      { value: "INJURED", label: "Chấn thương" },
                      { value: "SUSPENDED", label: "Bị treo giò" },
                    ]}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Đội bóng"
                    name="teamId"
                    value={player.teamId ? String(player.teamId) : ""}
                    options={teamOptions.map((team) => ({
                      value: String(team.id),
                      label: team.name,
                    }))}
                    onChange={handleChange}
                    placeholder="Chọn đội bóng"
                  />
                  <InputField
                    label="Avatar URL"
                    name="avatar"
                    value={player.avatar ?? ""}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-xl font-bold">Thể hình</h3>

                <div className="grid gap-8 md:grid-cols-2">
                  <RangeSlider
                    label="Chiều cao"
                    value={player.height}
                    min={140}
                    max={220}
                    unit="cm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPlayer(
                        (prev) =>
                          new Player({
                            ...prev,
                            height: Number(e.target.value),
                          }),
                      )
                    }
                  />

                  <RangeSlider
                    label="Cân nặng"
                    value={player.weight}
                    min={40}
                    max={120}
                    unit="kg"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPlayer(
                        (prev) =>
                          new Player({
                            ...prev,
                            weight: Number(e.target.value),
                          }),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-6 py-3 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-green-700 px-8 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : isEditMode
                      ? "Cập nhật cầu thủ"
                      : "Lưu cầu thủ"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-bold uppercase opacity-60">{label}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

type InputFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: InputFieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="px-1 text-xs font-bold uppercase tracking-wider text-[#40493d]">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d631b]/20"
    />
  </div>
);

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
};

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Chọn",
}: SelectFieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="px-1 text-xs font-bold uppercase tracking-wider text-[#40493d]">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl bg-[#eae8e4] px-4 py-3 text-sm outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

type RangeSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const RangeSlider = ({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: RangeSliderProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-end justify-between">
      <label className="px-1 text-xs font-bold uppercase tracking-wider text-[#40493d]">
        {label}
      </label>
      <span className="text-2xl font-black text-[#0d631b] font-['Be_Vietnam_Pro']">
        {value} <span className="text-xs font-normal text-[#40493d]">{unit}</span>
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#eae8e4] accent-[#0d631b]"
    />
    <div className="flex justify-between text-[10px] font-bold uppercase text-[#40493d]/40">
      <span>
        {min} {unit}
      </span>
      <span>
        {max} {unit}
      </span>
    </div>
  </div>
);
