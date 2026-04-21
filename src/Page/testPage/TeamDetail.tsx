import React from "react";

// --- Components nhỏ ---

const SidebarItem = ({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex items-center gap-3 p-4 rounded-full transition-all duration-300 ${
      active
        ? "bg-gradient-to-r from-[#2E7D32] to-[#0d631b] text-white shadow-lg scale-105"
        : "text-[#1b1c1a] opacity-70 hover:opacity-100 hover:bg-white/50 hover:translate-x-1"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-['Inter'] text-sm font-medium">{label}</span>
  </a>
);

const PlayerCard = ({
  name,
  position,
  statLabel,
  statValue,
  number,
  imageUrl,
}: any) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300">
    <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-2 right-2 bg-[#2E7D32] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shadow-lg">
        {number}
      </div>
    </div>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg text-[#1b1c1a] leading-tight">
          {name}
        </h3>
        <p className="text-sm text-[#2E7D32] font-medium">{position}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
          {statLabel}
        </p>
        <p className="text-sm font-black text-[#1b1c1a]">{statValue}</p>
      </div>
    </div>
  </div>
);

const MatchResult = ({
  date,
  status,
  teamA,
  teamB,
  score,
  scoreColor,
}: any) => (
  <div className="bg-[#f5f3ef] p-4 rounded-lg flex items-center justify-between hover:bg-gray-200 transition-colors">
    <div className="flex flex-col items-center w-12">
      <p className="text-[10px] font-bold text-gray-500 uppercase">{date}</p>
      <p className="text-lg font-black text-[#1b1c1a]">{status}</p>
    </div>
    <div className="flex-1 flex items-center justify-center gap-4">
      <div className="text-right">
        <p className="text-xs font-bold text-[#1b1c1a]">{teamA}</p>
      </div>
      <div
        className={`bg-white px-3 py-1 rounded-full font-black text-sm shadow-sm ${scoreColor}`}
      >
        {score}
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-[#1b1c1a]">{teamB}</p>
      </div>
    </div>
  </div>
);

// --- Component Chính ---

const TeamDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] text-[#1b1c1a]">
      {/* Link Google Fonts & Icons trong thực tế nên để ở file index.html hoặc _document.tsx */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f5] shadow-sm flex justify-between items-center px-8 py-4 h-20">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#2E7D32] tracking-tighter font-['Be_Vietnam_Pro']">
            PitchMaster
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#2E7D32] font-bold" href="#">
              Trang chủ
            </a>
            <a
              className="text-[#1b1c1a] opacity-60 hover:opacity-100 transition-opacity"
              href="#"
            >
              Giải đấu
            </a>
            <a
              className="text-[#1b1c1a] opacity-60 hover:opacity-100 transition-opacity"
              href="#"
            >
              Câu lạc bộ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-600">
                notifications
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-600">
                settings
              </span>
            </button>
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#2E7D32] object-cover"
            />
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-5rem)] w-72 sticky top-20 bg-[#f5f3ef] flex flex-col gap-2 p-6 hidden lg:flex rounded-tr-[2rem]">
          <div className="mb-8">
            <h3 className="font-['Be_Vietnam_Pro'] font-black text-[#2E7D32] text-xl uppercase">
              Tactical Hub
            </h3>
            <p className="text-xs text-gray-500">Elite Data Insights</p>
          </div>
          <nav className="space-y-2">
            <SidebarItem icon="emoji_events" label="Leagues" />
            <SidebarItem icon="calendar_today" label="Fixtures" />
            <SidebarItem icon="scoreboard" label="Results" />
            <SidebarItem icon="shield" label="Clubs" active />
            <SidebarItem icon="person" label="Players" />
            <SidebarItem icon="gavel" label="Referees" />
          </nav>
          <button className="mt-auto bg-[#2E7D32] text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">live_tv</span>
            Match Day Live
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Club Hero Banner */}
          <section className="mb-12 relative h-80 rounded-3xl overflow-hidden shadow-2xl group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10 flex items-end gap-8 w-full">
              <div className="w-32 h-32 bg-white rounded-2xl p-4 shadow-xl flex items-center justify-center">
                <span className="text-[#2E7D32] font-black text-4xl">CLB</span>
              </div>
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#2E7D32] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    Premier Elite
                  </span>
                  <span className="flex items-center gap-1 text-sm opacity-90">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>{" "}
                    Hà Nội, Việt Nam
                  </span>
                </div>
                <h1 className="text-5xl font-black mb-2 tracking-tight font-['Be_Vietnam_Pro']">
                  Dragon City FC
                </h1>
                <p className="font-medium text-lg opacity-90">
                  Sân vận động Quốc gia Mỹ Đình • 40,192 chỗ
                </p>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="text-center px-6 py-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[10px] text-[#a3f69c] font-bold uppercase mb-1">
                    Thứ hạng
                  </p>
                  <p className="text-3xl font-black text-white">02</p>
                </div>
                <div className="text-center px-6 py-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[10px] text-[#a3f69c] font-bold uppercase mb-1">
                    Phong độ
                  </p>
                  <div className="flex gap-1 mt-2">
                    {[1, 1, 0, 1, -1].map((v, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${v === 1 ? "bg-green-400" : v === 0 ? "bg-blue-400" : "bg-red-400"}`}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Squad List */}
            <div className="xl:col-span-2">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter font-['Be_Vietnam_Pro']">
                    Đội hình thi đấu
                  </h2>
                  <p className="text-gray-500">
                    Danh sách 25 cầu thủ đăng ký mùa giải 2023/24
                  </p>
                </div>
                <button className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <PlayerCard
                  name="Nguyễn Quang Hải"
                  position="Tiền vệ tấn công"
                  statLabel="Thể lực"
                  statValue="98%"
                  number="10"
                  imageUrl="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400"
                />
                <PlayerCard
                  name="Phạm Tuấn Hải"
                  position="Tiền đạo cánh"
                  statLabel="Bàn thắng"
                  statValue="12"
                  number="07"
                  imageUrl="https://images.unsplash.com/photo-1544606491-01ec04a17ed1?auto=format&fit=crop&q=80&w=400"
                />
                <PlayerCard
                  name="Filip Nguyễn"
                  position="Thủ môn"
                  statLabel="Sạch lưới"
                  statValue="08"
                  number="01"
                  imageUrl="https://images.unsplash.com/photo-1628891890377-57bc230cf009?auto=format&fit=crop&q=80&w=400"
                />
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 font-['Be_Vietnam_Pro']">
                  <span className="material-symbols-outlined text-[#2E7D32]">
                    history
                  </span>
                  Kết quả gần đây
                </h2>
                <div className="space-y-4">
                  <MatchResult
                    date="14 TH12"
                    status="THẮNG"
                    teamA="Dragon City"
                    teamB="Saigon FC"
                    score="3 - 1"
                    scoreColor="text-green-600"
                  />
                  <MatchResult
                    date="08 TH12"
                    status="HÒA"
                    teamA="Nam Dinh"
                    teamB="Dragon City"
                    score="2 - 2"
                    scoreColor="text-blue-600"
                  />
                  <MatchResult
                    date="01 TH12"
                    status="THẮNG"
                    teamA="Dragon City"
                    teamB="Viettel FC"
                    score="1 - 0"
                    scoreColor="text-green-600"
                  />
                </div>
              </div>

              {/* Trophies */}
              <div className="bg-gradient-to-br from-[#4c56af] to-[#27308a] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-6">
                    Thành tích nổi bật
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#959efd] text-4xl">
                        emoji_events
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-70">
                          V.League 1
                        </p>
                        <p className="font-bold text-lg">5 Lần Vô Địch</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#959efd] text-4xl">
                        military_tech
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-70">
                          Cúp Quốc Gia
                        </p>
                        <p className="font-bold text-lg">3 Lần Vô Địch</p>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-white/10 text-[160px] rotate-12">
                  shield
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white flex justify-around items-center py-3 z-50 border-t">
        <a className="flex flex-col items-center gap-1 opacity-60" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px]">Trang chủ</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-[#2E7D32]" href="#">
          <span className="material-symbols-outlined">shield</span>
          <span className="text-[10px]">CLB</span>
        </a>
        <a className="flex flex-col items-center gap-1 opacity-60" href="#">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px]">Thống kê</span>
        </a>
        <a className="flex flex-col items-center gap-1 opacity-60" href="#">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px]">Cá nhân</span>
        </a>
      </nav>
    </div>
  );
};

export default TeamDetail;
