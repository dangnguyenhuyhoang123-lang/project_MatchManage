import React, { useState } from "react";

const AddPlayer: React.FC = () => {
  // State quản lý thông số thể hình
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-['Inter']">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f5f3ef] flex flex-col py-8 px-4 font-['Be_Vietnam_Pro'] z-50">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black text-[#2E7D32] tracking-tighter">
            PitchPro
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#2E7D32]/60 font-bold">
            Elite Management
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="trophy" label="Tournaments" />
          <NavItem icon="event_repeat" label="Rounds" />
          <NavItem icon="groups" label="Clubs" />
          <NavItem icon="person" label="Players" active />
          <NavItem icon="how_to_reg" label="Registration" />
          <NavItem icon="calendar_month" label="Schedule" />
          <NavItem icon="sports_score" label="Results" />
          <NavItem icon="leaderboard" label="Standings" />
          <NavItem icon="assessment" label="Reports" />
          <NavItem icon="settings" label="Configuration" />
        </nav>

        <div className="mt-auto px-4 pt-4 border-t border-black/5">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP2MfQ20JBzMkq5HqqogEG2H7uX_WdBU54nschsnZidZiBJ9HFLxz-YYbl6bXqW0i1AshHctqmP3to99qQjlXqljE2JE3s1dU0ZQ4VGrdaX7osehGrq2HYpCYkGBG5BJIP9wY81Ook_MuGGJ8s8mwyoFUnaCxD3B2vv_5j_8qoeSX5fELhKt_hqAAoOrtaPDJF7y70QTqmG38rDYIZrv5FzmjP6SQoSwUrtOINfL0mTzeDr3GjuEQGHPzk5UktnIXPJtkCasTSqg"
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-xs font-bold">Admin User</p>
              <p className="text-[10px] text-[#40493d]">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1">
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center px-8 h-16 sticky top-0 z-40 bg-[#fbf9f5]/80 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#40493d]/50 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-10 pr-4 py-2 bg-[#f5f3ef] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0d631b]/20"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="material-symbols-outlined p-2 hover:bg-stone-200/50 rounded-full transition-colors">
              notifications
            </button>
            <div className="h-8 w-[1px] bg-black/10"></div>
            <span className="text-sm font-bold text-[#0d631b]">
              Tactical Dashboard
            </span>
          </div>
        </header>

        {/* Form Content */}
        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-xs text-[#40493d]/60 mb-2">
              <span>Hệ thống</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span>Cầu thủ</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-[#0d631b] font-semibold">
                Thêm cầu thủ mới
              </span>
            </nav>
            <h2 className="text-4xl font-black font-['Be_Vietnam_Pro'] tracking-tight">
              6.1. Thêm cầu thủ mới
            </h2>
            <p className="text-[#40493d] mt-1">
              Đăng ký thành viên mới vào danh sách đội hình chiến thuật của câu
              lạc bộ.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer w-40 h-40">
                  <div className="w-full h-full rounded-full bg-[#f5f3ef] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuASzKBV4hXtnYPjvYsg06wG77gOxhUrCaoLK8vSiZVrjSHh_W0T5iGHkUPeadWA_W12mx7tW99i7wlbS03ob2MZ8BXFztmOyPLzcc67huzX1TmB7DRpnjwuZ5orb9y3bmgC7OFnCah84Xx53DxAF9V4B5KwznWTmj0EQHoLiryWJ4ytlNxHzkBQQMjpC2aKlDe9awbqB59au4lG62FHpj8awFRoK8dUoTKD-CB2SPuSZmCRxYWNUqlL7knfAoC4Oa3BRiykzthBpA"
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs">
                      <span className="material-symbols-outlined mb-1">
                        photo_camera
                      </span>
                      <span>Thay đổi ảnh</span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-bold font-['Be_Vietnam_Pro']">
                  Ảnh đại diện
                </h3>
                <p className="text-xs text-[#40493d]/70 mt-2 px-4">
                  Định dạng: JPG, PNG. Tối đa 2MB.
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1 bg-[#e0e0ff] text-[#000767] text-[10px] font-bold rounded-full uppercase">
                    Elite Member
                  </span>
                  <span className="px-3 py-1 bg-[#a3f69c] text-[#002204] text-[10px] font-bold rounded-full uppercase">
                    Active
                  </span>
                </div>
              </div>

              <div className="bg-[#2e7d32] text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-2 font-['Be_Vietnam_Pro']">
                    Chỉ số mặc định
                  </h4>
                  <p className="text-sm opacity-80 mb-4">
                    Sẽ được cập nhật sau kiểm tra y tế.
                  </p>
                  <div className="flex justify-between">
                    <StatItem label="Sức mạnh" value="--" />
                    <StatItem label="Tốc độ" value="--" />
                    <StatItem label="Kỹ thuật" value="--" />
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 fill-1">
                  monitoring
                </span>
              </div>
            </div>

            {/* Right Column Form */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#959efd] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <h3 className="text-xl font-bold font-['Be_Vietnam_Pro']">
                    Thông tin cơ bản
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Họ tên cầu thủ"
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                  <InputField label="Ngày sinh" type="date" />
                  <SelectField
                    label="Vị trí thi đấu"
                    options={["Thủ môn", "Hậu vệ", "Tiền vệ", "Tiền đạo"]}
                  />
                  <InputField label="Số áo" placeholder="10" type="number" />
                  <InputField label="Quốc tịch" placeholder="Việt Nam" />
                  <InputField
                    label="CLB chủ quản"
                    placeholder="Nhập tên câu lạc bộ"
                  />
                </div>
              </div>

              {/* Physical Specs */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#a3f69c] flex items-center justify-center text-[#002204]">
                    <span className="material-symbols-outlined">
                      straighten
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-['Be_Vietnam_Pro']">
                    Thông số thể hình
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RangeSlider
                    label="Chiều cao (cm)"
                    value={height}
                    min={140}
                    max={220}
                    unit="cm"
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                  <RangeSlider
                    label="Cân nặng (kg)"
                    value={weight}
                    min={40}
                    max={120}
                    unit="kg"
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 pb-10">
                <button className="px-8 py-3 rounded-full font-bold hover:bg-black/5 transition-all">
                  Hủy
                </button>
                <button className="px-10 py-3 rounded-full bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white font-bold shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-all">
                  <span className="material-symbols-outlined text-xl">
                    save
                  </span>
                  Lưu cầu thủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 px-4 py-3 transition-all rounded-full scale-95 ${
      active
        ? "text-[#2E7D32] bg-white font-bold shadow-sm"
        : "text-[#1b1c1a]/60 hover:text-[#2E7D32] hover:bg-white/50"
    }`}
    href="#"
  >
    <span className={`material-symbols-outlined ${active ? "fill-1" : ""}`}>
      {icon}
    </span>
    {label}
  </a>
);

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

export default AddPlayer;
