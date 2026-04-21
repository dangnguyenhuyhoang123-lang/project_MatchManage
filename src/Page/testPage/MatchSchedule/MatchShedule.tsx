import React from "react";

export default function MatchSchedule() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#f5f3ef] border-r border-gray-200 hidden md:flex flex-col py-6 px-4 shrink-0 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#0d631b] flex items-center justify-center text-white">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0d631b] leading-tight">
              Manchester City
            </h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
              Premier League
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink icon="dashboard" label="Dashboard" />
          <SidebarLink icon="strategy" label="Tactics" />
          <SidebarLink icon="groups" label="Squad" />
          <SidebarLink icon="sports_soccer" label="Matches" active />
          <SidebarLink icon="leaderboard" label="Analytics" />
          <SidebarLink icon="payments" label="Finances" />
        </nav>

        <div className="mt-auto px-2 space-y-2">
          <button className="w-full bg-[#0d631b] text-white py-3 rounded-full font-bold text-xs shadow-md hover:opacity-90 transition-all">
            Match Day Live
          </button>
          <SidebarLink icon="help" label="Help Center" />
          <SidebarLink icon="logout" label="Logout" />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 min-w-0">
        {/* Header Bar */}
        <header className="h-16 border-b border-gray-100 bg-[#fbf9f5]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <span className="text-xl font-black text-[#0d631b]">
            Elite Soccer Management
          </span>
          <div className="flex items-center gap-4">
            <div className="bg-[#efeeea] px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-gray-400">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-xs w-40 outline-none"
                placeholder="Tìm kiếm..."
              />
            </div>
            <span className="material-symbols-outlined text-gray-400 cursor-pointer">
              notifications
            </span>
            <span className="material-symbols-outlined text-gray-400 cursor-pointer">
              settings
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-green-600">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="avatar"
              />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-6">
          {/* Title & Breadcrumb */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Trang chủ</span> <span>/</span>{" "}
              <span className="text-[#1b1c1a]">Lịch thi đấu</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter">
              LẬP LỊCH THI ĐẤU
            </h1>
          </div>

          {/* Warning Alert */}
          <div className="bg-[#ffdad6] border-l-4 border-[#ba1a1a] p-4 rounded-r-xl flex items-start gap-3">
            <span
              className="material-symbols-outlined text-[#ba1a1a]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <div className="text-sm">
              <p className="font-bold text-[#410002]">Cảnh báo hệ thống</p>
              <p className="text-[#410002]/80">
                Phát hiện trùng lịch thi đấu tại <b>Sân vận động Etihad</b> vào
                ngày 12/05/2024. Vui lòng kiểm tra lại!
              </p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="bg-[#f5f3ef] p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase px-1">
                  Giải đấu
                </label>
                <select className="bg-white border-none rounded-lg text-sm font-bold py-2 pl-3 pr-8 focus:ring-1 focus:ring-green-600">
                  <option>V-League 1 2023/24</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase px-1">
                  Vòng đấu
                </label>
                <select className="bg-white border-none rounded-lg text-sm font-bold py-2 pl-3 pr-8 focus:ring-1 focus:ring-green-600">
                  <option>Vòng 12</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-[#0d631b] px-5 py-2.5 rounded-full font-bold text-sm shadow-sm border border-green-100 flex items-center gap-2 hover:bg-green-50 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>{" "}
                Thêm trận đấu mới
              </button>
              <button className="bg-[#0d631b] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-sm">
                  auto_awesome
                </span>{" "}
                Tạo lịch tự động
              </button>
            </div>
          </div>

          {/* Match List Table */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-2">Thời gian</div>
              <div className="col-span-4 text-center">Trận đấu</div>
              <div className="col-span-3">Sân vận động</div>
              <div className="col-span-2 text-right">Trạng thái</div>
              <div className="col-span-1"></div>
            </div>

            {/* Row 1: Normal */}
            <MatchRow
              time="15:00"
              date="12/05/2024"
              team1="Hà Nội FC"
              team2="Hải Phòng"
              stadium="SVĐ Hàng Đẫy"
              status="Chưa diễn ra"
            />

            {/* Row 2: Conflict */}
            <MatchRow
              time="15:00"
              date="12/05/2024"
              team1="Nam Định"
              team2="Bình Định"
              stadium="SVĐ Hàng Đẫy"
              status="Trùng lịch sân"
              hasConflict
            />

            {/* Row 3: Normal */}
            <MatchRow
              time="18:00"
              date="12/05/2024"
              team1="LPBank HAGL"
              team2="TP.HCM FC"
              stadium="SVĐ Pleiku"
              status="Chưa diễn ra"
            />
          </div>
        </div>
      </main>

      {/* Floating Save Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#0d631b] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          save
        </span>
      </button>
    </div>
  );
}

// --- Sub-components for Cleanliness ---

function SidebarLink({
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
      className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${active ? "bg-white text-[#0d631b] font-bold shadow-sm" : "text-gray-500 hover:text-[#0d631b] hover:bg-gray-200/50"}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="text-xs">{label}</span>
    </a>
  );
}

function MatchRow({
  time,
  date,
  team1,
  team2,
  stadium,
  status,
  hasConflict = false,
}: any) {
  return (
    <div
      className={`grid grid-cols-12 items-center p-5 rounded-2xl transition-all border ${hasConflict ? "bg-[#fff1f0] border-[#ffdad6]" : "bg-white border-transparent hover:border-gray-100 shadow-sm"}`}
    >
      <div className="col-span-2">
        <p
          className={`text-sm font-black ${hasConflict ? "text-[#ba1a1a]" : "text-[#1b1c1a]"}`}
        >
          {time}
        </p>
        <p
          className={`text-[10px] font-bold ${hasConflict ? "text-[#ba1a1a]/70" : "text-gray-400"}`}
        >
          {date}
        </p>
      </div>

      <div className="col-span-4 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center w-20">
          <div className="w-8 h-8 bg-gray-100 rounded-full mb-1"></div>
          <span className="text-[10px] font-black text-center leading-tight">
            {team1}
          </span>
        </div>
        <span className="text-gray-300 font-black italic">VS</span>
        <div className="flex flex-col items-center w-20">
          <div className="w-8 h-8 bg-gray-100 rounded-full mb-1"></div>
          <span className="text-[10px] font-black text-center leading-tight">
            {team2}
          </span>
        </div>
      </div>

      <div className="col-span-3 flex items-center gap-2">
        <span
          className={`material-symbols-outlined text-sm ${hasConflict ? "text-[#ba1a1a]" : "text-gray-400"}`}
          style={hasConflict ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {hasConflict ? "warning" : "location_on"}
        </span>
        <span
          className={`text-[11px] font-bold ${hasConflict ? "text-[#ba1a1a]" : "text-gray-600"}`}
        >
          {stadium}
        </span>
      </div>

      <div className="col-span-2 text-right">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${hasConflict ? "bg-[#ba1a1a] text-white" : "bg-[#efeeea] text-gray-500"}`}
        >
          {status}
        </span>
      </div>

      <div className="col-span-1 flex justify-end gap-1">
        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
