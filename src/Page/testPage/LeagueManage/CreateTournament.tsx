import React from "react";

export default function CreateTournament() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans">
      {/* --- TOP BAR --- */}
      <nav className="sticky top-0 z-50 w-full bg-[#fbf9f5] flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-tight text-[#0d631b]">
            PitchMaster
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#f5f3ef] px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-64 outline-none"
              placeholder="Tìm kiếm..."
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-500">
                notifications
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-500">
                account_circle
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* --- SIDE NAVIGATION --- */}
        <aside className="h-[calc(100vh-72px)] w-64 fixed left-0 top-[72px] bg-[#f5f3ef] hidden md:flex flex-col py-6 border-r border-gray-100">
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2e7d32] flex items-center justify-center text-white">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div>
              <p className="text-sm font-bold">Quản Lý Giải</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                Elite Level
              </p>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            <SidebarItem icon="dashboard" label="Bảng điều khiển" />
            <SidebarItem icon="emoji_events" label="Giải đấu" active />
            <SidebarItem icon="sports_soccer" label="Trận đấu" />
            <SidebarItem icon="groups" label="Đội bóng" />
            <SidebarItem icon="leaderboard" label="Phân tích" />
          </nav>

          <div className="px-4 mt-auto space-y-2">
            <SidebarItem icon="settings" label="Cài đặt" />
            <button className="w-full bg-white border border-gray-200 py-3 rounded-xl text-[#0d631b] font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-sm">upgrade</span>{" "}
              Nâng cấp Pro
            </button>
          </div>
        </aside>

        {/* --- MAIN FORM --- */}
        <main className="flex-1 md:ml-64 p-4 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb & Title */}
            <header className="mb-10">
              <nav className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <span>Giải đấu</span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
                <span className="text-[#0d631b] font-bold">Thêm mới</span>
              </nav>
              <h1 className="text-4xl font-black tracking-tight">
                Khởi tạo giải đấu mới
              </h1>
              <p className="text-gray-500 mt-2">
                Thiết lập thông tin cơ bản và quy định vận hành cho mùa giải
                mới.
              </p>
            </header>

            <form className="space-y-12">
              {/* Thông tin chung */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold text-lg">Thông tin chung</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cung cấp các thông tin nhận diện cơ bản.
                  </p>
                  <div className="mt-6 w-48 h-48 rounded-2xl bg-[#eae8e4] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#0d631b] hover:bg-white transition-all group">
                    <span className="material-symbols-outlined text-gray-400 text-4xl group-hover:text-[#0d631b]">
                      cloud_upload
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold text-center px-4">
                      Kéo thả hoặc click để tải lên
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                      Tên giải đấu
                    </label>
                    <input
                      className="w-full bg-[#f5f3ef] border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#0d631b]"
                      placeholder="Ví dụ: V-League 1..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectBox
                      label="Mùa giải"
                      options={["Mùa 2023 - 2024", "Mùa 2024 - 2025"]}
                    />
                    <SelectBox
                      label="Quy mô giải"
                      options={["Cấp quốc gia", "Cấp khu vực"]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputDate label="Ngày bắt đầu" />
                    <InputDate label="Ngày kết thúc" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Cấu hình & Quy định */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold text-lg">Cấu hình & Quy định</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Xác định giới hạn và phương thức tính điểm.
                  </p>
                  <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 text-blue-700">
                    <span className="material-symbols-outlined text-[20px]">
                      info
                    </span>
                    <p className="text-[11px] font-medium leading-relaxed">
                      Quy định áp dụng tự động cho hệ thống.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Giới hạn đội & độ tuổi
                    </div>
                    <NumberInput label="Số đội tối đa" val={16} />
                    <NumberInput label="Tuổi tối thiểu" val={18} />
                    <NumberInput label="Tuổi tối đa" val={45} />
                  </div>

                  {/* Points System */}
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Hệ thống tính điểm
                    </div>
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
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <ToggleItem
                      icon="verified_user"
                      label="Yêu cầu xác minh danh tính cầu thủ"
                      active
                    />
                    <ToggleItem
                      icon="public"
                      label="Công khai thông tin trên trang cộng đồng"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-4 py-8 border-t border-gray-100">
                <button
                  type="button"
                  className="px-8 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-[#0d631b] text-white font-bold rounded-full shadow-lg shadow-green-900/20 hover:bg-[#0a4d15] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    save
                  </span>{" "}
                  Lưu thông tin giải đấu
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Các thành phần con đơn giản ---

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${active ? "bg-[#0d631b] text-white shadow-md" : "text-gray-500 hover:bg-gray-200"}`}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </a>
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
        <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">
          expand_more
        </span>
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
        <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none bg-[#f5f3ef] px-1">
          calendar_today
        </span>
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
