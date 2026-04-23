import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

export const AddPlayerModal: React.FC<Props> = ({ onClose }) => {
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl bg-[#fbf9f5] rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* HEADER MODAL */}
        <div className="sticky top-0 z-20 bg-[#fbf9f5] border-b px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-black font-['Be_Vietnam_Pro']">
            Thêm cầu thủ mới
          </h2>
          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border flex flex-col items-center text-center">
                <div className="relative group cursor-pointer w-40 h-40">
                  <div className="w-full h-full rounded-full bg-[#f5f3ef] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuASzKBV4hXtnYPjvYsg06wG77gOxhUrCaoLK8vSiZVrjSHh_W0T5iGHkUPeadWA_W12mx7tW99i7wlbS03ob2MZ8BXFztmOyPLzcc67huzX1TmB7DRpnjwuZ5orb9y3bmgC7OFnCah84Xx53DxAF9V4B5KwznWTmj0EQHoLiryWJ4ytlNxHzkBQQMjpC2aKlDe9awbqB59au4lG62FHpj8awFRoK8dUoTKD-CB2SPuSZmCRxYWNUqlL7knfAoC4Oa3BRiykzthBpA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-bold">Ảnh đại diện</h3>
              </div>

              <div className="bg-[#2e7d32] text-white p-6 rounded-2xl">
                <h4 className="font-bold mb-4">Chỉ số mặc định</h4>
                <div className="flex justify-between">
                  <StatItem label="Sức mạnh" value="--" />
                  <StatItem label="Tốc độ" value="--" />
                  <StatItem label="Kỹ thuật" value="--" />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border">
                <h3 className="text-xl font-bold mb-6">Thông tin cơ bản</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Họ tên cầu thủ" />
                  <InputField label="Ngày sinh" type="date" />
                  <SelectField
                    label="Vị trí"
                    options={["Thủ môn", "Hậu vệ", "Tiền vệ", "Tiền đạo"]}
                  />
                  <InputField label="Số áo" type="number" />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border">
                <h3 className="text-xl font-bold mb-6">Thể hình</h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <RangeSlider
                    label="Chiều cao"
                    value={height}
                    min={140}
                    max={220}
                    unit="cm"
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                  <RangeSlider
                    label="Cân nặng"
                    value={weight}
                    min={40}
                    max={120}
                    unit="kg"
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button className="px-8 py-3 rounded-full bg-green-700 text-white font-bold">
                  Lưu cầu thủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase font-bold opacity-60">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

const InputField = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-[#40493d] uppercase tracking-wider px-1">
      {label}
    </label>
    <input
      className="w-full bg-[#eae8e4] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0d631b]/20 outline-none"
      {...props}
    />
  </div>
);

const SelectField = ({
  label,
  options,
}: {
  label: string;
  options: string[];
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-[#40493d] uppercase tracking-wider px-1">
      {label}
    </label>
    <select className="w-full bg-[#eae8e4] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0d631b]/20 appearance-none outline-none">
      <option value="" disabled selected>
        Chọn vị trí
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const RangeSlider = ({ label, value, min, max, unit, onChange }: any) => (
  <div className="flex flex-col gap-3">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-[#40493d] uppercase tracking-wider px-1">
        {label}
      </label>
      <span className="text-[#0d631b] font-black font-['Be_Vietnam_Pro'] text-2xl">
        {value}{" "}
        <span className="text-xs font-normal text-[#40493d]">{unit}</span>
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-[#eae8e4] rounded-full appearance-none cursor-pointer accent-[#0d631b]"
    />
    <div className="flex justify-between text-[10px] text-[#40493d]/40 font-bold uppercase">
      <span>
        {min} {unit}
      </span>
      <span>
        {max} {unit}
      </span>
    </div>
  </div>
);
