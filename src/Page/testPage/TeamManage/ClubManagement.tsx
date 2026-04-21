import React, { useState } from "react";

// --- Interfaces ---
interface Club {
  id: string;
  name: string;
  logo: string;
  stadium: string;
  foundedYear: number;
  playerCount: number;
  status: "active" | "inactive";
  region: "North" | "Central" | "South";
}

const INITIAL_CLUBS: Club[] = [
  {
    id: "HNFC",
    name: "CLB Hà Nội FC",
    logo: "https://placehold.co/64x64",
    stadium: "Sân vận động Hàng Đẫy",
    foundedYear: 2006,
    playerCount: 28,
    status: "active",
    region: "North",
  },
  {
    id: "HAGL",
    name: "Hoàng Anh Gia Lai",
    logo: "https://placehold.co/64x64",
    stadium: "Sân vận động Pleiku",
    foundedYear: 2001,
    playerCount: 25,
    status: "active",
    region: "Central",
  },
  {
    id: "VFC",
    name: "Thể Công - Viettel",
    logo: "https://placehold.co/64x64",
    stadium: "Sân vận động Mỹ Đình",
    foundedYear: 1954,
    playerCount: 30,
    status: "active",
    region: "North",
  },
  {
    id: "AGFC",
    name: "CLB An Giang",
    logo: "https://placehold.co/64x64",
    stadium: "Sân vận động Long Xuyên",
    foundedYear: 1976,
    playerCount: 0,
    status: "inactive",
    region: "South",
  },
];

const ClubManagement: React.FC = () => {
  const [filter, setFilter] = useState<string>("Tất cả");

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-['Inter']">
      {/* Styles & Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* Sidebar Navigation */}
      <aside className="w-64 fixed h-full bg-[#f5f3ef] p-6 flex flex-col border-r border-stone-200">
        <div className="mb-10 px-4">
          <span className="text-2xl font-black text-[#0d631b] tracking-tighter font-['Be_Vietnam_Pro']">
            PitchPro
          </span>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Elite Management
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink icon="dashboard" label="Dashboard" />
          <SidebarLink icon="trophy" label="Tournaments" />
          <SidebarLink icon="groups" label="Clubs" active />
          <SidebarLink icon="person" label="Players" />
          <SidebarLink icon="how_to_reg" label="Registration" />
          <SidebarLink icon="settings" label="Configuration" />
        </nav>

        <div className="pt-6 border-t border-gray-200 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div>
            <p className="font-bold text-xs">Admin PitchPro</p>
            <p className="text-[10px] opacity-60 uppercase font-bold">
              Elite Access
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header Bar */}
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md px-8 flex justify-between items-center z-40 border-b border-gray-100">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 transition-all focus-within:ring-2 focus-within:ring-green-100">
            <span className="material-symbols-outlined text-gray-400 mr-2">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm câu lạc bộ..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <IconButton icon="notifications" />
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Bùi Xuân Bách</span>
              <div className="w-8 h-8 rounded-full bg-green-200" />
            </div>
          </div>
        </header>

        <section className="p-8">
          {/* Page Title */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2 font-['Be_Vietnam_Pro']">
                Quản lý Câu lạc bộ
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0d631b] rounded-full" />
                <p className="text-gray-500 font-medium">
                  Hệ thống điều hành các đội bóng chuyên nghiệp
                </p>
              </div>
            </div>
            <button className="bg-[#0d631b] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
              <span className="material-symbols-outlined">add_circle</span>
              Thêm CLB mới
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-3 mb-8">
            {["Tất cả", "Miền Bắc", "Miền Trung", "Miền Nam"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  filter === item
                    ? "bg-[#0d631b] text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {item === "Tất cả" ? "Tất cả CLB" : item}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <IconButton icon="tune" />
              <IconButton icon="grid_view" active />
              <IconButton icon="format_list_bulleted" />
            </div>
          </div>

          {/* Club Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INITIAL_CLUBS.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}

            {/* Add New Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-[#0d631b]/30 transition-all group">
              <div className="w-12 h-12 rounded-full bg-green-50 text-[#0d631b] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h4 className="font-bold font-['Be_Vietnam_Pro']">
                Tạo Câu Lạc Bộ Mới
              </h4>
              <p className="text-xs text-gray-400 mt-2 max-w-[200px]">
                Mở rộng quy mô giải đấu bằng cách thêm đội bóng mới
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-12 grid grid-cols-4 gap-6">
            <div className="col-span-2 bg-green-50/50 p-6 rounded-2xl flex items-center gap-6 border border-green-100/50">
              <div className="w-16 h-16 bg-[#0d631b] text-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  analytics
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-green-800/60">
                  Tổng số CLB
                </h4>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black font-['Be_Vietnam_Pro']">
                    42
                  </span>
                  <span className="text-[#0d631b] font-bold text-sm mb-1">
                    +4 mùa này
                  </span>
                </div>
              </div>
            </div>
            <StatCard
              label="Trung bình cầu thủ"
              value="26.4"
              sub="mỗi đội hình"
            />
            <StatCard
              label="Hệ thống"
              value="Ổn định"
              sub="Cập nhật 2 phút trước"
              isStatus
            />
          </div>
        </section>
      </main>
    </div>
  );
};

// --- Sub-components ---

const SidebarLink = ({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all ${
      active
        ? "bg-white text-[#0d631b] shadow-sm"
        : "text-gray-500 hover:text-[#0d631b] hover:bg-white/50"
    }`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span> {label}
  </a>
);

const IconButton = ({
  icon,
  active = false,
}: {
  icon: string;
  active?: boolean;
}) => (
  <button
    className={`p-2.5 rounded-full transition-all ${
      active
        ? "bg-[#0d631b] text-white shadow-md"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    <span className="material-symbols-outlined text-sm">{icon}</span>
  </button>
);

const ClubCard = ({ club }: { club: Club }) => (
  <div
    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 transition-all group ${club.status === "inactive" ? "opacity-60 grayscale" : ""}`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden ring-4 ring-[#fbf9f5]">
        <img
          src={club.logo}
          alt={club.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          club.status === "active"
            ? "bg-green-100 text-[#0d631b]"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {club.status === "active" ? "Đang tham gia" : "Ngừng hoạt động"}
      </span>
    </div>

    <h3 className="text-xl font-bold mb-4 font-['Be_Vietnam_Pro'] group-hover:text-[#0d631b] transition-colors">
      {club.name}
    </h3>

    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
        <span className="material-symbols-outlined text-sm opacity-60">
          stadium
        </span>{" "}
        {club.stadium}
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
        <span className="material-symbols-outlined text-sm opacity-60">
          calendar_today
        </span>{" "}
        Thành lập: {club.foundedYear}
      </div>
      <div className="flex items-center gap-3 text-sm font-bold text-[#4c56af]">
        <span className="material-symbols-outlined text-sm opacity-60">
          groups
        </span>{" "}
        {club.playerCount} cầu thủ
      </div>
    </div>

    <div className="flex gap-2 pt-4 border-t border-gray-50">
      <button className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-full text-xs font-bold hover:bg-[#4c56af] hover:text-white transition-all">
        Chi tiết
      </button>
      <button className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
        <span className="material-symbols-outlined text-sm">edit</span>
      </button>
      <button className="p-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
        <span className="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  sub,
  isStatus = false,
}: {
  label: string;
  value: string;
  sub: string;
  isStatus?: boolean;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
      {label}
    </h4>
    {isStatus ? (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-[#0d631b] rounded-full animate-pulse" />
        <span className="text-xl font-black font-['Be_Vietnam_Pro'] text-[#0d631b]">
          {value}
        </span>
      </div>
    ) : (
      <span className="text-2xl font-black font-['Be_Vietnam_Pro']">
        {value}
      </span>
    )}
    <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>
  </div>
);

export default ClubManagement;
