import React from "react";
import { useState } from "react";

export default function CreateTournament({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-5xl max-h-[90vh] flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-black">Khởi tạo giải đấu mới</h1>
        <p className="text-sm text-gray-500">
          Thiết lập thông tin cơ bản và quy định vận hành
        </p>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {/* SECTION 1 */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div>
            <h3 className="font-bold">Thông tin chung</h3>
            <p className="text-sm text-gray-500 mt-1">
              Cung cấp thông tin nhận diện
            </p>

            {/* Upload */}
            <div className="mt-4 w-40 h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-green-700">
              Upload logo
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-2 bg-stone-50 p-6 rounded-2xl space-y-4">
            <input
              placeholder="Tên giải đấu"
              className="w-full bg-white px-4 py-3 rounded-xl outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectBox
                label="Mùa giải"
                options={["Mùa 2023-2024", "Mùa 2024-2025"]}
              />
              <SelectBox
                label="Quy mô"
                options={["Cấp quốc gia", "Cấp khu vực"]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputDate label="Ngày bắt đầu" />
              <InputDate label="Ngày kết thúc" />
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div>
            <h3 className="font-bold">Cấu hình</h3>
            <p className="text-sm text-gray-500">Thiết lập quy định</p>
          </div>

          {/* RIGHT */}
          <div className="col-span-2 bg-stone-50 p-6 rounded-2xl space-y-6">
            {/* NUMBER */}
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Số đội" val={16} />
              <NumberInput label="Tuổi min" val={18} />
              <NumberInput label="Tuổi max" val={45} />
            </div>

            {/* POINT */}
            <div className="grid grid-cols-3 gap-4">
              <PointCard
                label="Thắng"
                score="3"
                color="text-green-700"
                bg="bg-green-50"
              />
              <PointCard
                label="Hòa"
                score="1"
                color="text-blue-700"
                bg="bg-blue-50"
              />
              <PointCard
                label="Thua"
                score="0"
                color="text-red-700"
                bg="bg-red-50"
              />
            </div>

            {/* TOGGLE */}
            <ToggleItem icon="verified_user" label="Xác minh cầu thủ" active />
            <ToggleItem icon="public" label="Công khai thông tin" />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-gray-200"
        >
          Hủy bỏ
        </button>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-700 text-white rounded-full"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}

function SelectBox({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-600 mb-2">{label}</label>
      <div className="relative">
        <select className="w-full bg-[#f5f3ef] border-none rounded-xl px-4 py-3 appearance-none outline-none">
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function InputDate({ label }: { label: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-600 mb-2">{label}</label>
      <div className="relative">
        <input
          type="date"
          className="w-full bg-[#f5f3ef] border-none rounded-xl px-4 py-3 outline-none"
        />
      </div>
    </div>
  );
}

function NumberInput({ label, val }: { label: string; val: number }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-600 mb-2">{label}</label>
      <input
        type="number"
        defaultValue={val}
        className="w-full bg-[#f5f3ef] border-none rounded-xl px-4 py-3 text-center font-black outline-none"
      />
    </div>
  );
}

function PointCard({
  label,
  score,
  color,
  bg,
}: {
  label: string;
  score: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} ${color} p-4 rounded-xl flex flex-col items-center border border-transparent hover:border-current transition-all`}
    >
      <span className="text-2xl font-black">{score}</span>
      <span className="text-[10px] font-bold uppercase mt-1 opacity-70">
        {label}
      </span>
    </div>
  );
}

function ToggleItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#f5f3ef] rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-400">{icon}</span>
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <div
        className={`w-10 h-5 rounded-full relative transition-all ${active ? "bg-[#0d631b]" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`}
        ></div>
      </div>
    </div>
  );
}
