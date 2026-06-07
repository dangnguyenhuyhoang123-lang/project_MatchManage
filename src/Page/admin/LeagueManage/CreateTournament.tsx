import React, { useEffect, useMemo, useState } from "react";
import { League } from "../../../model/LeagueModel";
import LeagueService from "../../../services/LeagueService";

interface Props {
  onClose: () => void;
  currentLeague?: League | null;
  onSuccess: () => void;
}

// Tạo empty league.
const createEmptyLeague = () =>
  new League({
    name: "",
    country: "Việt Nam",
    scale: "Quốc gia",
    status: "ACTIVE",
    logo: null,
  });

// Tạo tournament.
export default function CreateTournament({
  onClose,
  currentLeague,
  onSuccess,
}: Props) {
  const [league, setLeague] = useState<League>(createEmptyLeague());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = useMemo(() => Boolean(currentLeague?.id), [currentLeague]);

  useEffect(() => {
    setLeague(currentLeague ? new League(currentLeague) : createEmptyLeague());
    setErrorMsg("");
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

  // Xử lý gui biểu mẫu.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!league.name?.trim()) {
      setErrorMsg("Vui lòng nhập tên giải đấu.");
      return;
    }

    if (!league.country?.trim()) {
      setErrorMsg("Vui lòng nhập quốc gia.");
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
      setErrorMsg("Có lỗi xảy ra khi lưu giải đấu. Vui lòng kiểm tra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-[#F5F3EF]">
      <div className="relative overflow-hidden border-b border-[#E4E2DE] bg-white px-7 py-6">
        <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#B2F746]/30 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#707A6C]">
              League setup
            </p>
            <h1 className="font-['Be_Vietnam_Pro'] text-2xl font-black text-[#1B1C1A]">
              {isEditMode ? "Cập nhật giải đấu" : "Khởi tạo giải đấu mới"}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#707A6C]">
              Quản lý thông tin nhận diện, trạng thái và logo của giải đấu.
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
          <aside className="lg:col-span-4">
            <div className="sticky top-0 rounded-[1.75rem] border border-[#E4E2DE] bg-white p-6 shadow-[0_8px_24px_rgba(0,73,14,0.06)]">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-[1.5rem] border border-[#E4E2DE] bg-[#F5F3EF] p-4 shadow-inner">
                {league.logo ? (
                  <img
                    src={league.logo}
                    alt={league.name || "Logo giải đấu"}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[#707A6C]">
                    <span className="material-symbols-outlined text-5xl text-[#0D631B]">
                      trophy
                    </span>
                    <p className="mt-2 text-xs font-bold">Logo giải đấu</p>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-[1.25rem] bg-[#F5F3EF] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#707A6C]">
                  Preview
                </p>
                <h2 className="mt-1 line-clamp-2 text-lg font-black text-[#1B1C1A]">
                  {league.name || "Tên giải đấu"}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#40493D]">
                    {league.country || "Quốc gia"}
                  </span>
                  <span className="rounded-full bg-[#B2F746]/40 px-3 py-1 text-[11px] font-black text-[#0D631B]">
                    {league.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-5 lg:col-span-8">
            <div className="rounded-[1.75rem] border border-[#E4E2DE] bg-white p-6 shadow-[0_8px_24px_rgba(0,73,14,0.05)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D631B]/10 text-[#0D631B]">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B1C1A]">
                    Thông tin chung
                  </h3>
                  <p className="text-xs font-medium text-[#707A6C]">
                    Các trường này được dùng để hiển thị và lọc giải đấu.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <InputField
                  label="Tên giải đấu"
                  name="name"
                  value={league.name}
                  onChange={handleChange}
                  placeholder="Giải Vô địch Quốc gia (V.League 1)"
                  required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Quốc gia"
                    name="country"
                    value={league.country}
                    onChange={handleChange}
                    placeholder="Việt Nam"
                    required
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

            <div className="rounded-[1.75rem] border border-[#E4E2DE] bg-[#0D631B] p-5 text-white shadow-[0_12px_30px_rgba(13,99,27,0.18)]">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined rounded-full bg-white/10 p-2">
                  info
                </span>
                <div>
                  <p className="text-sm font-bold">Gợi ý nghiệp vụ</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    Sau khi tạo League, hãy mở dòng giải đấu để tạo Season bên
                    trong. Season sẽ kế thừa ngữ cảnh League và gắn với bộ luật
                    thi đấu.
                  </p>
                </div>
              </div>
            </div>
          </section>
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
            disabled={isSubmitting}
            className="rounded-full bg-[#0D631B] px-7 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#00490E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Đang lưu..."
              : isEditMode
                ? "Cập nhật"
                : "Tạo giải đấu"}
          </button>
        </div>
      </form>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  value?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
};

// Hiển thị InputField.
function InputField({
  label,
  name,
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
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[1rem] border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-[#1B1C1A] outline-none transition placeholder:text-[#707A6C]/60 focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value?: string | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

// Hiển thị SelectField.
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#707A6C]">
        {label}
      </span>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full appearance-none rounded-[1rem] border border-transparent bg-[#F5F3EF] px-4 py-3 text-sm font-semibold text-[#1B1C1A] outline-none transition focus:border-[#0D631B] focus:bg-white focus:ring-4 focus:ring-[#0D631B]/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
