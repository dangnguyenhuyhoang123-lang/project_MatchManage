import React from "react";
import { Sidebar } from "../../utils/SideBar";

// Định nghĩa kiểu dữ liệu cho bảng xếp hạng
interface TeamStanding {
  rank: number;
  name: string;
  stadium: string;
  played: number;
  stats: string; // T-H-B
  hs: string; // Hiệu số
  points: number;
  last5: ("W" | "D" | "L")[];
  rankColor: string;
}

const standingsData: TeamStanding[] = [
  {
    rank: 1,
    name: "Thanh Hóa FC",
    stadium: "Sân vận động: Thanh Hóa",
    played: 15,
    stats: "10 - 3 - 2",
    hs: "+12",
    points: 33,
    last5: ["W", "W", "D", "L", "W"],
    rankColor: "border-l-yellow-400",
  },
  {
    rank: 2,
    name: "Thép Xanh Nam Định",
    stadium: "Sân vận động: Thiên Trường",
    played: 15,
    stats: "9 - 4 - 2",
    hs: "+10",
    points: 31,
    last5: ["W", "L", "W", "W", "D"],
    rankColor: "border-l-gray-400",
  },
  {
    rank: 3,
    name: "Hà Nội FC",
    stadium: "Sân vận động: Hàng Đẫy",
    played: 15,
    stats: "8 - 3 - 4",
    hs: "+8",
    points: 27,
    last5: ["D", "W", "W", "D", "W"],
    rankColor: "border-l-orange-400",
  },
  {
    rank: 4,
    name: "Công An Hà Nội",
    stadium: "Sân vận động: Hàng Đẫy",
    played: 15,
    stats: "7 - 4 - 4",
    hs: "+5",
    points: 25,
    last5: ["W", "L", "L", "W", "W"],
    rankColor: "border-l-green-500",
  },
  {
    rank: 5,
    name: "Becamex Bình Dương",
    stadium: "Sân vận động: Gò Đậu",
    played: 15,
    stats: "7 - 3 - 5",
    hs: "+2",
    points: 24,
    last5: ["L", "L", "W", "D", "L"],
    rankColor: "border-l-red-500",
  },
];

export default function StandingsPage() {
  return (
    <div className="flex bg-[#f8f9fa] text-slate-900 min-h-screen font-sans">
      {/* Sidebar - Cố định bên trái theo mẫu của bạn */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header bar */}
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-10">
          <div className="relative">
            <input
              placeholder="Tìm kiếm CLB, cầu thủ..."
              className="bg-gray-100 px-10 py-2 rounded-full w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 border-none"
            />
            <span className="absolute left-4 top-2.5 opacity-40 text-xs">
              🔍
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
              🔔
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
          </div>
        </header>

        <div className="px-10 py-8">
          {/* Page Title & Filters */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                <span className="text-green-700">Bảng Xếp</span> Hạng
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật kết quả thi đấu mới nhất từ V-League 1
              </p>
            </div>

            <div className="flex gap-2">
              {["V-League 1", "Mùa giải 2024", "Vòng 15 (Hiện tại)"].map(
                (filter, idx) => (
                  <button
                    key={idx}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {filter} <span className="opacity-40 text-[8px]">▼</span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Standings Table Card */}
          <div className="bg-[#f0ede6]/40 p-6 rounded-[2rem] border border-gray-200 shadow-sm">
            {/* Grid Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-4">
              <div className="col-span-1 text-center">Hạng</div>
              <div className="col-span-4">Câu lạc bộ</div>
              <div className="col-span-1 text-center">Trận</div>
              <div className="col-span-2 text-center">T - H - B</div>
              <div className="col-span-1 text-center">HS (BT/BB)</div>
              <div className="col-span-1 text-center">Điểm</div>
              <div className="col-span-2 text-center">5 trận gần nhất</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {standingsData.map((team) => (
                <div
                  key={team.rank}
                  className={`grid grid-cols-12 items-center bg-white p-4 rounded-2xl shadow-sm border-l-4 ${team.rankColor} hover:translate-x-1 transition-transform`}
                >
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${team.rank <= 3 ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-400"}`}
                    >
                      {team.rank}
                    </span>
                  </div>

                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 border border-gray-100">
                      LOGO
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        {team.name}
                      </p>
                      <p className="text-[10px] opacity-50 uppercase font-semibold">
                        {team.stadium}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1 text-center font-bold">
                    {team.played}
                  </div>
                  <div className="col-span-2 text-center text-sm font-medium text-slate-600">
                    {team.stats}
                  </div>
                  <div className="col-span-1 text-center">
                    <p className="font-bold text-green-600">{team.hs}</p>
                    <p className="text-[9px] opacity-40">(26/14)</p>
                  </div>
                  <div className="col-span-1 text-center font-black text-lg">
                    {team.points}
                  </div>

                  <div className="col-span-2 flex justify-center gap-1.5">
                    {team.last5.map((res, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${
                          res === "W"
                            ? "bg-green-600"
                            : res === "D"
                              ? "bg-indigo-500"
                              : "bg-red-500"
                        }`}
                      >
                        {res}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer / Rules */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center px-4">
              <div className="flex gap-4 text-[10px] font-bold opacity-60">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>{" "}
                  THẮNG
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>{" "}
                  HÒA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> THUA
                </span>
              </div>
              <div className="max-w-md text-[10px] leading-relaxed text-right opacity-50 font-medium">
                <p>
                  <span className="font-bold text-slate-900">
                    Quy tắc xếp hạng:
                  </span>{" "}
                  1. Tổng điểm; 2. Hiệu số bàn thắng/bại; 3. Tổng số bàn thắng;
                  4. Đối đầu trực tiếp; 5. Chỉ số Fair-play.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Feature Cards */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-green-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl mb-4 flex items-center justify-center text-xl">
                  📈
                </div>
                <h3 className="text-xl font-bold mb-2">Phong độ cao nhất</h3>
                <p className="text-sm opacity-70 mb-6">
                  Hà Nội FC đã có chuỗi 5 trận bất bại liên tiếp trên sân nhà.
                </p>
                <button className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded-full text-xs font-bold transition">
                  Xem chi tiết
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-indigo-50 text-indigo-900 p-8 rounded-[2.5rem] flex justify-between items-start shadow-sm border border-indigo-100">
              <div className="max-w-[60%]">
                <h3 className="text-xl font-bold mb-2">
                  Cuộc đua Vua Phá Lưới
                </h3>
                <p className="text-sm opacity-70 mb-6 font-medium">
                  Rafaelson (Nam Định) đang dẫn đầu với 14 bàn thắng sau 15 vòng
                  đấu.
                </p>
                <div className="flex -space-x-3 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-indigo-50 shadow-sm"
                    ></div>
                  ))}
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-indigo-700 transition">
                  Xem chi tiết
                </button>
              </div>
              <div className="w-32 h-32 bg-indigo-200/50 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative">
                🏆
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-[8px] font-black px-2 py-1 rounded-full text-white">
                  TOP 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
