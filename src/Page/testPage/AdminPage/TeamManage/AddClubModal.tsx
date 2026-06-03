import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TeamModel } from "../../../../model/TeamModel";
import TeamService from "../../../../services/TeamService";
import StadiumService from "../../../../services/StadiumService";

type StadiumOption = {
  id: number;
  name: string;
};

interface Props {
  onClose: () => void;
  currentTeam?: TeamModel | null;
  onSuccess: () => void;
}

const createEmptyTeam = () =>
  new TeamModel({
    name: "",
    logo: null,
    establishedYear: new Date().getFullYear(),
    city: "",
    region: "Nam",
    owner: "",
    description: "",
    status: "ACTIVE",
    stadiumId: null,
    stadiumName: null,
  });

const AddClubModal: React.FC<Props> = ({ onClose, currentTeam, onSuccess }) => {
  const [team, setTeam] = useState<TeamModel>(createEmptyTeam());
  const [stadiums, setStadiums] = useState<StadiumOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = useMemo(() => Boolean(currentTeam?.id), [currentTeam]);

  useEffect(() => {
    setTeam(currentTeam ? new TeamModel(currentTeam) : createEmptyTeam());
    setErrors({});
  }, [currentTeam]);

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const response = await StadiumService.getAllStadiums();
        const rawStadiums = Array.isArray(response.data)
          ? response.data
          : (response.data?.content ?? []);

        setStadiums(
          rawStadiums
            .map((stadium: any) => ({
              id: Number(stadium.id),
              name: stadium.name,
            }))
            .filter(
              (stadium: StadiumOption) =>
                Number.isFinite(stadium.id) && Boolean(stadium.name),
            ),
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách sân:", error);
        setStadiums([]);
      }
    };

    fetchStadiums();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

    setTeam((prev) => {
      const next = new TeamModel(prev);

      if (name === "establishedYear") {
        next.establishedYear = Number(value);
        return next;
      }

      if (name === "stadiumId") {
        const stadiumId = value ? Number(value) : null;
        next.stadiumId = stadiumId;
        next.stadiumName =
          stadiums.find((stadium) => stadium.id === stadiumId)?.name ?? null;
        next.stadium = next.stadiumName ?? "";
        return next;
      }

      (next as unknown as Record<string, unknown>)[name] = value || "";
      return next;
    });
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn file hình ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ảnh không nên vượt quá 2MB để tránh dữ liệu lưu quá lớn.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTeam(
        (prev) => new TeamModel({ ...prev, logo: String(reader.result || "") }),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!team.name.trim()) nextErrors.name = "Vui lòng nhập tên đội bóng.";
    if (!team.city.trim()) nextErrors.city = "Vui lòng nhập thành phố.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      if (team.id) {
        await TeamService.updateTeam(team.id, team);
      } else {
        await TeamService.addTeam(team);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu đội bóng:", error);
      toast.error("Có lỗi xảy ra khi lưu đội bóng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      <div className="relative z-10 mx-4 w-full max-w-6xl">
        <div className="max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-[#fbf9f5] shadow-2xl">
          <main className="flex-1">
            <div className="mx-auto max-w-5xl p-10">
              <div className="mb-12">
                <div className="mb-4 flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-zinc-100"
                  >
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </button>

                  <span className="text-xs font-bold uppercase text-blue-500">
                    Hệ Thống Quản Lý CLB
                  </span>
                </div>

                <h1 className="mb-2 text-4xl font-black">
                  {isEditMode ? "Cập nhật Câu Lạc Bộ" : "Thêm Câu Lạc Bộ Mới"}
                </h1>

                <p className="text-zinc-500">
                  Đồng bộ dữ liệu đội bóng với API quản lý đội.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 flex flex-col items-center rounded-2xl border bg-white p-8 md:col-span-4">
                    <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name || "logo"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-gray-400">
                          image
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold">Biểu trưng CLB</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Dùng URL logo hoặc chọn file ảnh từ máy để hiển thị ảnh
                      đại diện.
                    </p>
                    <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
                      <span className="material-symbols-outlined mr-1 text-[16px]">
                        upload
                      </span>
                      Chọn logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="col-span-12 rounded-2xl border bg-white p-8 md:col-span-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InputField
                        name="name"
                        value={team.name}
                        onChange={handleInputChange}
                        placeholder="Tên CLB"
                        label="Tên đội bóng"
                        error={errors.name}
                      />
                      <InputField
                        name="logo"
                        value={team.logo ?? ""}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        label="Logo URL"
                      />
                      <InputField
                        name="establishedYear"
                        type="number"
                        value={team.establishedYear}
                        onChange={handleInputChange}
                        label="Năm thành lập"
                      />
                      <InputField
                        name="city"
                        value={team.city}
                        onChange={handleInputChange}
                        placeholder="TP. Hồ Chí Minh"
                        label="Thành phố"
                        error={errors.city}
                      />
                      <SelectField
                        name="region"
                        value={team.region}
                        onChange={handleInputChange}
                        label="Khu vực"
                        options={["Bắc", "Trung", "Nam"]}
                      />
                      <SelectField
                        name="status"
                        value={team.status}
                        onChange={handleInputChange}
                        label="Trạng thái"
                        options={["ACTIVE", "INACTIVE"]}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 rounded-2xl bg-gray-100 p-8 md:col-span-7">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InputField
                        name="owner"
                        value={team.owner}
                        onChange={handleInputChange}
                        placeholder="Chủ sở hữu"
                        label="Chủ sở hữu"
                      />
                      <SelectField
                        name="stadiumId"
                        value={team.stadiumId ? String(team.stadiumId) : ""}
                        onChange={handleInputChange}
                        label="Sân vận động"
                        options={stadiums.map((stadium) => ({
                          label: stadium.name,
                          value: String(stadium.id),
                        }))}
                        placeholder="Chọn sân"
                      />
                    </div>
                  </div>

                  <div className="col-span-12 rounded-2xl bg-blue-500 p-8 text-white md:col-span-5">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={team.description}
                      onChange={handleInputChange}
                      className="min-h-[160px] w-full rounded bg-white/10 p-3 outline-none placeholder:text-white/70"
                      placeholder="Mô tả đội bóng..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>

                  <button
                    disabled={isSubmitting}
                    className="rounded bg-green-600 px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting
                      ? "Đang lưu..."
                      : isEditMode
                        ? "Cập nhật"
                        : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

type InputFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  placeholder?: string;
  type?: string;
  error?: string;
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: InputFieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded bg-gray-100 p-3"
    />
    {error && (
      <p className="mt-1 text-sm font-semibold text-red-600">{error}</p>
    )}
  </div>
);

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  options: Array<string | { label: string; value: string }>;
  placeholder?: string;
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Chọn",
}: SelectFieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-gray-700">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded bg-gray-100 p-3"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => {
        const normalized =
          typeof option === "string"
            ? { label: option, value: option }
            : option;

        return (
          <option key={normalized.value} value={normalized.value}>
            {normalized.label}
          </option>
        );
      })}
    </select>
  </div>
);

export default AddClubModal;
