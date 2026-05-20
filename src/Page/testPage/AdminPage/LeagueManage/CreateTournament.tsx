import React, { useEffect, useMemo, useState } from "react";
import { League } from "../../../../model/LeagueModel";
import LeagueService from "../../../../services/LeagueService";

interface Props {
  onClose: () => void;
  currentLeague?: League | null;
  onSuccess: () => void;
}

const createEmptyLeague = () =>
  new League({
    name: "",
    country: "Việt Nam",
    scale: "Quốc gia",
    status: "ACTIVE",
    logo: null,
  });

export default function CreateTournament({
  onClose,
  currentLeague,
  onSuccess,
}: Props) {
  const [league, setLeague] = useState<League>(createEmptyLeague());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = useMemo(() => Boolean(currentLeague?.id), [currentLeague]);

  useEffect(() => {
    setLeague(currentLeague ? new League(currentLeague) : createEmptyLeague());
  }, [currentLeague]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLeague((prev) => {
      const next = new League(prev);
      (next as unknown as Record<string, unknown>)[name] = value || null;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!league.name.trim()) {
      alert("Vui lòng nhập tên giải đấu.");
      return;
    }

    if (!league.country.trim()) {
      alert("Vui lòng nhập quốc gia.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (league.id) {
        await LeagueService.updateLeague(league.id, league);
      } else {
        await LeagueService.addLeague(league);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu giải đấu:", error);
      alert("Có lỗi xảy ra khi lưu giải đấu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-black">
          {isEditMode ? "Cập nhật giải đấu" : "Khởi tạo giải đấu mới"}
        </h1>
        <p className="text-sm text-gray-500">
          Đồng bộ dữ liệu giải đấu với API backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h3 className="font-bold">Thông tin chung</h3>
            <p className="mt-1 text-sm text-gray-500">
              Cung cấp dữ liệu nhận diện của giải đấu.
            </p>

            <div className="mt-4 flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-xs text-gray-400">
              {league.logo ? (
                <img
                  src={league.logo}
                  alt={league.name || "logo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                "Logo giải đấu"
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-4 rounded-2xl bg-stone-50 p-6">
            <InputField
              label="Tên giải đấu"
              name="name"
              value={league.name}
              onChange={handleChange}
              placeholder="Giải Vô địch Quốc gia (V.League 1)"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Quốc gia"
                name="country"
                value={league.country}
                onChange={handleChange}
                placeholder="Việt Nam"
              />
              <SelectField
                label="Quy mô"
                name="scale"
                value={league.scale}
                onChange={handleChange}
                options={["Quốc gia", "Khu vực", "Quốc tế"]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Trạng thái"
                name="status"
                value={league.status}
                onChange={handleChange}
                options={["ACTIVE", "INACTIVE"]}
              />
              <InputField
                label="Logo URL"
                name="logo"
                value={league.logo ?? ""}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t px-0 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-200 px-6 py-2"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-green-700 px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-bold text-gray-600">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border-none bg-white px-4 py-3 outline-none"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-bold text-gray-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border-none bg-white px-4 py-3 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
