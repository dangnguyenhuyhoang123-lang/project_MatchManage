import React from "react";

export default function AddMatchModal() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#1b1c1a]/20 backdrop-blur-sm font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        {/* --- LEFT SIDE: BRANDING --- */}
        <div className="hidden md:block w-1/3 bg-gradient-to-br from-[#0d631b] to-[#2e7d32] p-8 text-white relative">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <span
                className="material-symbols-outlined text-4xl mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sports_soccer
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tighter">
                THIẾT LẬP
                <br />
                TRẬN ĐẤU
              </h2>
              <p className="mt-4 text-[#a3f69c]/80 text-sm leading-relaxed font-medium">
                Khởi tạo các thông số kỹ thuật cho trận đấu mới trong khuôn khổ
                giải đấu chính thức.
              </p>
            </div>

            <div className="mt-auto">
              {/* Hình ảnh minh họa sân cỏ/bóng đá */}
              <div className="w-full aspect-square rounded-xl bg-black/20 mb-4 overflow-hidden border border-white/20 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=500"
                  alt="Soccer stadium"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
                Match Management System v2.4
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-[#1b1c1a] flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#0d631b] rounded-full"></span>
              Thêm trận đấu mới
            </h3>
            <button className="md:hidden p-2 text-gray-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-6">
            {/* Tournament & Round Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectGroup
                label="Chọn giải đấu"
                icon="emoji_events"
                options={["V-League 1 - 2024", "Cúp Quốc Gia 2024"]}
              />
              <SelectGroup
                label="Chọn vòng đấu"
                icon="reorder"
                options={["Vòng 10", "Vòng 11", "Vòng 12"]}
              />
            </div>

            {/* Teams Selection Box */}
            <div className="p-6 bg-[#f5f3ef] rounded-2xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Cặp đấu chính thức
                </span>
                <span className="material-symbols-outlined text-[#0d631b] font-bold">
                  swap_horiz
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                <TeamSelect
                  label="Đội nhà"
                  side="left"
                  color="text-[#0d631b]"
                  icon="stadium"
                  options={["Hà Nội FC", "Công An Hà Nội"]}
                />
                <TeamSelect
                  label="Đội khách"
                  side="right"
                  color="text-[#4c56af]"
                  icon="flight_takeoff"
                  options={["Thép Xanh Nam Định", "Hải Phòng FC"]}
                />
              </div>
            </div>

            {/* Stadium Selection */}
            <SelectGroup
              label="Sân vận động"
              icon="location_on"
              options={[
                "Sân vận động Hàng Đẫy",
                "Sân vận động Mỹ Đình",
                "Sân vận động Thiên Trường",
              ]}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Ngày thi đấu"
                icon="calendar_today"
                type="date"
              />
              <InputGroup label="Giờ thi đấu" icon="schedule" type="time" />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row gap-4 pt-8 border-t border-gray-100 mt-10">
              <button
                type="button"
                className="flex-1 md:flex-none px-10 py-3.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#0d631b] to-[#2e7d32] px-10 py-3.5 rounded-full font-bold text-white shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  save
                </span>
                Lưu trận đấu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Internal UI Components ---

function SelectGroup({ label, icon, options }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 flex items-center gap-2 px-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>{" "}
        {label}
      </label>
      <div className="relative">
        <select className="w-full bg-[#efeeea] border-none rounded-xl py-3.5 px-4 appearance-none focus:ring-2 focus:ring-[#0d631b] transition-all font-bold text-sm">
          {options.map((opt: string) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-gray-400">
          expand_more
        </span>
      </div>
    </div>
  );
}

function TeamSelect({ label, side, color, icon, options }: any) {
  return (
    <div className={`space-y-2 ${side === "right" ? "text-right" : ""}`}>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">
        {label}
      </label>
      <div className="relative">
        <select
          className={`w-full bg-white border-2 border-transparent focus:border-current rounded-xl py-4 px-4 appearance-none transition-all text-lg font-black ${color} ${side === "right" ? "text-right pr-12" : "pl-12"}`}
        >
          {options.map((opt: string) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <span
          className={`material-symbols-outlined absolute ${side === "right" ? "right-4" : "left-4"} top-4.5 text-gray-300 pointer-events-none`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, type }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 flex items-center gap-2 px-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>{" "}
        {label}
      </label>
      <input
        type={type}
        className="w-full bg-[#efeeea] border-none rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-[#0d631b] transition-all font-bold text-sm"
      />
    </div>
  );
}
