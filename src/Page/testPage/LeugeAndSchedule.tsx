import React from "react";

// --- Interfaces & Types ---
interface Match {
  id: string;
  time: string;
  status: "FINISHED" | "UPCOMING" | "LIVE";
  homeTeam: { name: string; score?: number; logoColor: string };
  awayTeam: { name: string; score?: number; logoColor: string };
  scorers?: string;
  stadium?: string;
}

interface Standing {
  rank: number;
  name: string;
  points: number;
  logoColor: string;
}

const LeugeAndSchedule: React.FC = () => {
  // Mock data dựa trên thiết kế PitchMaster
  const matches: Match[] = [
    {
      id: "1",
      time: "KẾT THÚC",
      status: "FINISHED",
      homeTeam: { name: "Hà Nội FC", score: 2, logoColor: "text-primary" },
      awayTeam: { name: "Viettel FC", score: 1, logoColor: "text-indigo-600" },
      scorers: "Q. Hải 14', 67'; Hoàng Đức 45'",
    },
    {
      id: "2",
      time: "KẾT THÚC",
      status: "FINISHED",
      homeTeam: { name: "Hải Phòng", score: 0, logoColor: "text-red-500" },
      awayTeam: { name: "Nam Định", score: 0, logoColor: "text-blue-500" },
    },
    {
      id: "3",
      time: "19:15",
      status: "UPCOMING",
      homeTeam: { name: "Công An Hà Nội", logoColor: "text-amber-600" },
      awayTeam: { name: "HAGL", logoColor: "text-green-600" },
      stadium: "SVĐ Hàng Đẫy",
    },
  ];

  const standings: Standing[] = [
    { rank: 1, name: "Hà Nội FC", points: 12, logoColor: "text-primary" },
    { rank: 2, name: "Hải Phòng", points: 10, logoColor: "text-red-500" },
    { rank: 3, name: "Nam Định", points: 10, logoColor: "text-blue-500" },
    { rank: 4, name: "Viettel FC", points: 9, logoColor: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-['Inter']">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f5]/80 backdrop-blur-md flex justify-between items-center px-8 h-20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#2E7D32] font-['Be_Vietnam_Pro'] tracking-tighter">
            PitchMaster
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input
              className="bg-gray-100 border-none rounded-full px-6 py-2 w-64 text-sm focus:ring-2 focus:ring-[#2E7D32]"
              placeholder="Tìm kiếm giải đấu..."
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined opacity-60">
                notifications
              </span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-[#2E7D32] overflow-hidden">
              <img
                src="https://i.pravatar.cc/100"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-72 h-[calc(100vh-5rem)] sticky top-20 p-6 hidden md:flex flex-col gap-2 border-r border-gray-100">
          <div className="mb-6 px-4">
            <h2 className="font-['Be_Vietnam_Pro'] font-black text-[#2E7D32] text-xl">
              Tactical Hub
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Elite Data Insights
            </p>
          </div>
          <nav className="space-y-1">
            <SidebarItem icon="emoji_events" label="Leagues" active />
            <SidebarItem icon="calendar_today" label="Fixtures" />
            <SidebarItem icon="scoreboard" label="Results" />
            <SidebarItem icon="shield" label="Clubs" />
            <SidebarItem icon="person" label="Players" />
          </nav>
          <div className="mt-auto p-4 bg-green-50 rounded-2xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm text-[#2E7D32]">
                sensors
              </span>
              <span className="text-[10px] font-bold text-[#2E7D32] uppercase">
                Match Day Live
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Phân tích dữ liệu thời gian thực cho các trận đấu.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Banner */}
          <section className="relative h-[300px] rounded-3xl overflow-hidden mb-10 shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Stadium"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-5xl text-[#2E7D32]">
                  emoji_events
                </span>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#2E7D32] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Đang diễn ra
                  </span>
                  <span className="text-white/70 text-xs">
                    Mùa giải 2023/24
                  </span>
                </div>
                <h1 className="text-4xl font-black font-['Be_Vietnam_Pro'] tracking-tight mb-1">
                  V-League 1 Championship
                </h1>
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">
                    location_on
                  </span>{" "}
                  Việt Nam • 14 Câu lạc bộ
                </p>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-full w-max">
                <button className="px-6 py-2 bg-white text-[#2E7D32] font-bold rounded-full shadow-sm text-sm">
                  Lịch thi đấu
                </button>
                <button className="px-6 py-2 text-gray-500 hover:bg-white/50 rounded-full text-sm transition-all">
                  Kết quả
                </button>
                <button className="px-6 py-2 text-gray-500 hover:bg-white/50 rounded-full text-sm transition-all">
                  Bảng xếp hạng
                </button>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                  Thứ Bảy, 21 Tháng 10
                </h3>
                {matches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black font-['Be_Vietnam_Pro']">
                    Bảng Xếp Hạng
                  </h4>
                  <button className="text-[10px] font-bold text-[#2E7D32] uppercase">
                    Chi tiết
                  </button>
                </div>
                <div className="space-y-4">
                  {standings.map((s) => (
                    <StandingRow key={s.rank} standing={s} />
                  ))}
                </div>
              </div>

              {/* Tactical Card */}
              <div className="bg-gradient-to-br from-[#1a472a] to-[#2E7D32] p-6 rounded-3xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-sm">
                    insights
                  </span>
                  <h4 className="font-bold text-xs">Phân tích chuyên sâu</h4>
                </div>
                <p className="text-xs opacity-80 leading-relaxed mb-6">
                  Hà Nội FC đang có hiệu suất ghi bàn tốt nhất giải đấu với
                  trung bình 2.5 bàn/trận tại sân nhà.
                </p>
                <div className="flex items-end justify-between h-12 gap-1 px-2">
                  {[40, 65, 85, 55, 100].map((h, i) => (
                    <div
                      key={i}
                      className="w-full bg-white/20 rounded-t-sm transition-all hover:bg-white/40"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Sub-components ---
const SidebarItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => (
  <button
    className={`w-full flex items-center gap-4 px-6 py-3 rounded-full transition-all ${
      active
        ? "bg-[#2E7D32] text-white shadow-lg"
        : "text-gray-500 hover:bg-gray-100"
    }`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const MatchRow: React.FC<{ match: Match }> = ({ match }) => (
  <div className="bg-white p-5 rounded-2xl flex items-center gap-6 border border-gray-50 hover:shadow-md transition-shadow">
    <div
      className={`text-[10px] font-bold w-16 ${match.status === "UPCOMING" ? "text-[#2E7D32]" : "text-gray-400"}`}
    >
      {match.time}
    </div>
    <div className="flex-1 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 flex-1 justify-end">
        <span className="text-sm font-bold">{match.homeTeam.name}</span>
        <span
          className={`material-symbols-outlined ${match.homeTeam.logoColor}`}
        >
          shield
        </span>
      </div>
      <div className="mx-8 text-2xl font-black font-['Be_Vietnam_Pro'] text-[#1a472a] flex gap-4">
        {match.status === "FINISHED" ? (
          <>
            <span>{match.homeTeam.score}</span>
            <span className="text-gray-200">-</span>
            <span>{match.awayTeam.score}</span>
          </>
        ) : (
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-400">
            VS
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-1 justify-start">
        <span
          className={`material-symbols-outlined ${match.awayTeam.logoColor}`}
        >
          shield
        </span>
        <span className="text-sm font-bold">{match.awayTeam.name}</span>
      </div>
    </div>
    <div className="w-32 border-l border-gray-100 pl-4 text-right">
      <p className="text-[10px] text-gray-400 leading-tight">
        {match.scorers ||
          (match.stadium && (
            <span className="flex items-center justify-end gap-1">
              <span className="material-symbols-outlined text-[10px]">
                stadium
              </span>
              {match.stadium}
            </span>
          ))}
      </p>
    </div>
  </div>
);

const StandingRow: React.FC<{ standing: Standing }> = ({ standing }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <span
      className={`text-xs font-bold w-4 ${standing.rank === 1 ? "text-[#2E7D32]" : "text-gray-400"}`}
    >
      {standing.rank}
    </span>
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
      <span
        className={`material-symbols-outlined text-sm ${standing.logoColor}`}
      >
        shield
      </span>
    </div>
    <span className="text-xs font-bold flex-1">{standing.name}</span>
    <span
      className={`text-xs font-black ${standing.rank === 1 ? "text-[#2E7D32]" : ""}`}
    >
      {standing.points}
    </span>
  </div>
);

export default LeugeAndSchedule;
