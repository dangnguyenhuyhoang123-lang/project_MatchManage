import React from "react";

// --- Interfaces ---
interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  icon: string;
  trend?: string;
  isNegative?: boolean;
}

interface PlayerScorer {
  rank: number;
  name: string;
  club: string;
  goals: number;
}

interface AwardItem {
  category: string;
  name: string;
  emoji: string;
}

// --- Mock Data ---
const stats: StatCardProps[] = [
  {
    label: "TỔNG TRẬN ĐẤU",
    value: 380,
    subValue: "100%",
    icon: "🏟️",
    trend: "↑",
  },
  {
    label: "TỔNG BÀN THẮNG",
    value: "1,054",
    subValue: "2.8/trận",
    icon: "⚽",
    trend: "+",
  },
  {
    label: "THẺ PHẠT (Y/R)",
    value: "412 / 18",
    subValue: "Trung bình 1.1",
    icon: "🎴",
    isNegative: true,
  },
  {
    label: "TỶ LỆ BÀN THẮNG",
    value: "2.77",
    subValue: "Bàn / Trận",
    icon: "📊",
  },
];

const topScorers: PlayerScorer[] = [
  { rank: 1, name: "Rafaelson", club: "Thép Xanh Nam Định", goals: 31 },
  { rank: 2, name: "Lucão do Break", club: "Hải Phòng FC", goals: 19 },
  { rank: 3, name: "Phạm Tuấn Hải", club: "Hà Nội FC", goals: 15 },
];

const awards: AwardItem[] = [
  { category: "Găng tay vàng", name: "Trần Nguyên Mạnh", emoji: "🧤" },
  { category: "Cầu thủ trẻ xuất sắc", name: "Khuất Văn Khang", emoji: "🌟" },
  { category: "HLV xuất sắc nhất", name: "Vũ Hồng Việt", emoji: "👔" },
  { category: "Trọng tài xuất sắc", name: "Ngô Duy Lân", emoji: "🏁" },
];

export default function ReportPage() {
  return (
    <div className="flex bg-[#fbf9f5] text-[#1b1c1a] min-h-screen font-sans">
      {/* Sidebar - Fixed Left */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#f5f3ef] flex flex-col py-8 px-4 border-r border-gray-200">
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-xl">
            ⚽
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">
              V-League 2024
            </h1>
            <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider mt-1">
              Hệ thống báo cáo
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
          {[
            "Dashboard",
            "Giải đấu",
            "CLB",
            "Cầu thủ",
            "Lịch thi đấu",
            "BXH",
            "Báo cáo",
            "Cấu hình",
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium cursor-pointer transition-all ${
                item === "Báo cáo"
                  ? "bg-white text-green-700 shadow-sm border border-gray-100"
                  : "opacity-60 hover:bg-white/50"
              }`}
            >
              <span className="text-lg">
                {item === "Báo cáo" ? "📄" : "📁"}
              </span>
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 bg-[#fbf9f5]/80 backdrop-blur-md z-10 px-8 py-6 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-1">
              <span>Trang chủ</span> <span>›</span>{" "}
              <span className="text-green-700">Báo cáo</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Báo cáo tổng kết giải đấu
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold transition">
              Xuất PDF
            </button>
            <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold transition">
              Xuất Excel
            </button>
            <button className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-full text-xs font-bold shadow-lg shadow-green-900/20 transition">
              In báo cáo
            </button>
          </div>
        </header>

        <div className="px-8 pb-12 space-y-8">
          {/* Stats Grid */}
          <section className="grid grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{stat.value}</span>
                  <span
                    className={`text-[10px] font-bold ${stat.isNegative ? "text-red-500" : "text-green-600"}`}
                  >
                    {stat.trend} {stat.subValue}
                  </span>
                </div>
                <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 grayscale group-hover:grayscale-0 transition-all">
                  {stat.icon}
                </div>
              </div>
            ))}
          </section>

          {/* Main Dashboard Section */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Standings Table */}
            <section className="col-span-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Bảng xếp hạng chung cuộc</h3>
                <span className="text-[10px] font-bold text-gray-400 italic">
                  Cập nhật: 20/05/2024
                </span>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50/50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                  <div className="col-span-1">Hạng</div>
                  <div className="col-span-5">Câu lạc bộ</div>
                  <div className="col-span-1 text-center">Trận</div>
                  <div className="col-span-2 text-center">T - H - B</div>
                  <div className="col-span-1 text-center">HS</div>
                  <div className="col-span-2 text-center">Điểm</div>
                </div>
                {[
                  {
                    rank: 1,
                    name: "Hà Nội FC",
                    played: 38,
                    thb: "28-6-4",
                    hs: "+42",
                    pts: 90,
                    active: true,
                  },
                  {
                    rank: 2,
                    name: "Công An Hà Nội",
                    played: 38,
                    thb: "25-8-5",
                    hs: "+35",
                    pts: 83,
                  },
                  {
                    rank: 3,
                    name: "Thép Xanh Nam Định",
                    played: 38,
                    thb: "22-10-6",
                    hs: "+28",
                    pts: 76,
                  },
                  {
                    rank: 4,
                    name: "Becamex Bình Dương",
                    played: 38,
                    thb: "18-12-8",
                    hs: "+15",
                    pts: 66,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                  {
                    rank: 5,
                    name: "Đông Á Thanh Hóa",
                    played: 38,
                    thb: "16-10-12",
                    hs: "+8",
                    pts: 58,
                  },
                ].map((team, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 px-6 py-5 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition ${team.active ? "bg-green-50/30" : ""}`}
                  >
                    <div className="col-span-1">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${team.rank === 1 ? "bg-green-700 text-white shadow-md" : "bg-gray-100"}`}
                      >
                        {team.rank}
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <span
                        className={`font-bold ${team.active ? "text-green-800" : ""}`}
                      >
                        {team.name}
                      </span>
                    </div>
                    <div className="col-span-1 text-center font-medium">
                      {team.played}
                    </div>
                    <div className="col-span-2 text-center text-sm text-gray-500">
                      {team.thb}
                    </div>
                    <div className="col-span-1 text-center font-bold text-gray-700">
                      {team.hs}
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-xl font-black ${team.active ? "text-green-700" : ""}`}
                      >
                        {team.pts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right: Scorers & Distribution */}
            <aside className="col-span-4 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Vua phá lưới</h3>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  {topScorers.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center gap-4 p-3 rounded-2xl transition ${player.rank === 1 ? "bg-green-50" : "hover:bg-gray-50"}`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden"></div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${player.rank === 1 ? "bg-green-700" : "bg-gray-400"}`}
                        >
                          {player.rank}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm leading-none">
                          {player.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                          {player.club}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-green-700">
                          {player.goals}
                        </p>
                        <p className="text-[8px] font-black text-gray-300 uppercase">
                          Bàn thắng
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result Distribution (Simplified Mockup) */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Phân phối kết quả
                  </h4>
                  <span className="text-xl">🥧</span>
                </div>
                <div className="flex justify-center mb-6">
                  {/* Mock Pie Chart using CSS */}
                  <div className="w-32 h-32 rounded-full border-[12px] border-green-700 flex items-center justify-center relative">
                    <div className="text-center">
                      <p className="text-2xl font-black">380</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">
                        Trận
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-bold">
                  <div className="flex justify-between">
                    <span className="text-green-700">● Thắng (Đội nhà)</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">● Hòa</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-500">● Thắng (Khách)</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Row */}
          <section className="grid grid-cols-12 gap-8">
            {/* Goals by Time - Bar Chart Mockup */}
            <div className="col-span-7 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Bàn thắng theo thời điểm</h3>
                <div className="flex gap-4 text-[9px] font-black text-gray-400 uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-700"></span>{" "}
                    Hiệp 1
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>{" "}
                    Hiệp 2
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-40 gap-4">
                {[40, 65, 55, 50, 80, 95].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-3"
                  >
                    <div
                      className={`w-full rounded-t-xl transition-all hover:opacity-80 ${i < 3 ? "bg-green-100" : "bg-blue-100"}`}
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {i === 0
                        ? "0-15'"
                        : i === 1
                          ? "16-30'"
                          : i === 2
                            ? "31-45'"
                            : i === 3
                              ? "46-60'"
                              : i === 4
                                ? "61-75'"
                                : "76-90'"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Awards */}
            <div className="col-span-5 bg-gray-100/50 p-8 rounded-[2.5rem] border border-gray-200">
              <h3 className="text-xl font-bold mb-6">Danh hiệu cá nhân khác</h3>
              <div className="grid grid-cols-2 gap-4">
                {awards.map((award, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2"
                  >
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      {award.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{award.emoji}</span>
                      <span className="text-xs font-bold text-slate-800">
                        {award.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
