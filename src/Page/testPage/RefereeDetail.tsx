import React from "react";

// --- Sub-components để tối ưu code ---

const StatCard = ({ label, value, subtext, icon, bgColor, textColor }: any) => (
  <div
    className={`${bgColor} ${textColor} p-8 rounded-2xl flex flex-col justify-between shadow-sm`}
  >
    <div>
      <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
      <p className="font-['Be_Vietnam_Pro'] font-bold text-lg">{label}</p>
    </div>
    <div>
      <p className="text-5xl font-black font-['Be_Vietnam_Pro']">{value}</p>
      <p className="text-xs opacity-80">{subtext}</p>
    </div>
  </div>
);

const MatchRow = ({
  date,
  league,
  teamA,
  teamB,
  score,
  yellowCards,
  redCards,
}: any) => (
  <div className="grid grid-cols-12 items-center bg-white p-6 rounded-xl shadow-sm hover:scale-[1.01] transition-transform duration-200 border border-transparent hover:border-gray-200">
    <div className="col-span-2">
      <p className="text-xs font-bold text-gray-900">{date}</p>
      <p className="text-[10px] text-gray-500 font-medium uppercase">
        {league}
      </p>
    </div>
    <div className="col-span-4 flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{teamA}</span>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">shield</span>
        </div>
      </div>
      <span className="text-xs font-black text-gray-400 font-['Be_Vietnam_Pro']">
        VS
      </span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">shield</span>
        </div>
        <span className="text-sm font-bold">{teamB}</span>
      </div>
    </div>
    <div className="col-span-2 text-center">
      <span className="font-['Be_Vietnam_Pro'] font-black text-xl text-gray-900">
        {score}
      </span>
    </div>
    <div className="col-span-2 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
        <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
        <span className="text-sm font-black">{yellowCards}</span>
      </div>
    </div>
    <div className="col-span-2 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
        <div className="w-2 h-3 bg-red-500 rounded-sm"></div>
        <span className="text-sm font-black">{redCards}</span>
      </div>
    </div>
  </div>
);

// --- Component Chính ---

const RefereeDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] text-[#1b1c1a]">
      {/* Thêm link fonts/icons vào thực tế nên để ở _document.tsx hoặc index.html */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f5] shadow-[0_12px_32px_rgba(27,28,26,0.06)] flex justify-between items-center px-8 py-4 h-20">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#0d631b] tracking-tighter font-['Be_Vietnam_Pro']">
            PitchMaster
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input
              className="bg-gray-100 border-none rounded-full py-2 px-6 w-80 focus:ring-2 focus:ring-[#0d631b] text-sm"
              placeholder="Tìm kiếm trọng tài, giải đấu..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-gray-400">
              search
            </span>
          </div>
          <div className="flex gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90">
              <span className="material-symbols-outlined text-gray-600">
                notifications
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90">
              <span className="material-symbols-outlined text-gray-600">
                settings
              </span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#a3f69c]">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-5rem)] w-72 rounded-tr-[2rem] sticky top-20 bg-[#f5f3ef] flex flex-col gap-2 p-6 shadow-xl hidden md:flex">
          <div className="mb-8 px-4">
            <h2 className="font-['Be_Vietnam_Pro'] font-black text-[#0d631b] text-xl">
              Tactical Hub
            </h2>
            <p className="text-xs font-medium opacity-60">
              Elite Data Insights
            </p>
          </div>
          <nav className="flex-1 space-y-1">
            {["Leagues", "Fixtures", "Results", "Clubs", "Players"].map(
              (item, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="flex items-center gap-4 px-4 py-3 text-gray-700 opacity-70 hover:opacity-100 hover:bg-white/60 rounded-full transition-all hover:translate-x-1"
                >
                  <span className="material-symbols-outlined">
                    {
                      [
                        "emoji_events",
                        "calendar_today",
                        "scoreboard",
                        "shield",
                        "person",
                      ][idx]
                    }
                  </span>
                  <span className="font-medium">{item}</span>
                </a>
              ),
            )}
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-[#2E7D32] to-[#0d631b] text-white rounded-full shadow-lg scale-105 transition-all"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                gavel
              </span>
              <span className="font-medium">Referees</span>
            </a>
          </nav>
          <button className="mt-auto py-4 rounded-full bg-[#0d631b] text-white font-bold font-['Be_Vietnam_Pro'] shadow-lg hover:brightness-110 active:scale-95 transition-all">
            Match Day Live
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Referee Profile Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 items-end">
            <div className="lg:col-span-4 relative group">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600"
                  alt="Referee Portrait"
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#0d631b] text-white p-5 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  Cấp bậc chuyên môn
                </p>
                <p className="font-['Be_Vietnam_Pro'] font-black text-2xl tracking-tighter">
                  FIFA ELITE
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div>
                <nav className="flex gap-3 mb-6">
                  <span className="text-[11px] font-bold text-[#0d631b] uppercase bg-[#0d631b]/10 px-4 py-1.5 rounded-full">
                    Trọng tài chính
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-100 px-4 py-1.5 rounded-full">
                    Kinh nghiệm 12 năm
                  </span>
                </nav>
                <h1 className="font-['Be_Vietnam_Pro'] text-7xl font-black tracking-tighter text-gray-900 mb-2">
                  Nguyễn Văn An
                </h1>
                <p className="text-2xl text-gray-500 font-medium">
                  Hồ Chí Minh, Việt Nam
                </p>
              </div>

              <div className="flex flex-wrap gap-12 py-8 border-y border-gray-200">
                {[
                  { label: "Ngày sinh", value: "15/04/1988" },
                  { label: "Số trận đấu", value: "184" },
                  { label: "Thể lực tốt nhất", value: "9.2km/trận" },
                  { label: "Quốc tịch", value: "Việt Nam", flag: true },
                ].map((info, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      {info.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-['Be_Vietnam_Pro'] font-bold text-xl">
                        {info.value}
                      </p>
                      {info.flag && (
                        <div className="w-6 h-4 bg-red-600 rounded-sm relative shadow-sm border border-gray-100"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
              <h3 className="font-['Be_Vietnam_Pro'] font-bold text-lg mb-8">
                Thống kê kỷ luật (Mùa này)
              </h3>
              <div className="flex items-center justify-between gap-6">
                {[
                  {
                    val: "3.8",
                    sub: "Thẻ vàng / Trận",
                    color: "bg-yellow-400",
                    wrap: "bg-yellow-50",
                  },
                  {
                    val: "0.15",
                    sub: "Thẻ đỏ / Trận",
                    color: "bg-red-500",
                    wrap: "bg-red-50",
                  },
                  {
                    val: "0.24",
                    sub: "Penalty / Trận",
                    icon: "sports_handball",
                    wrap: "bg-blue-50",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`flex-1 text-center p-5 ${stat.wrap} rounded-2xl transition-transform hover:-translate-y-1`}
                  >
                    {stat.color ? (
                      <div
                        className={`w-8 h-12 ${stat.color} mx-auto rounded-sm shadow-md mb-4`}
                      ></div>
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-blue-600 mb-2">
                        {stat.icon}
                      </span>
                    )}
                    <p className="text-3xl font-black font-['Be_Vietnam_Pro'] text-gray-900">
                      {stat.val}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <StatCard
              label="Chỉ số uy tín"
              value="98.4%"
              subtext="Đánh giá từ ban trọng tài"
              icon="monitoring"
              bgColor="bg-[#0d631b]"
              textColor="text-white"
            />

            <div className="bg-gray-100 p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
              <div className="z-10">
                <h3 className="font-['Be_Vietnam_Pro'] font-bold text-lg">
                  Phạm lỗi trung bình
                </h3>
                <p className="text-4xl font-black font-['Be_Vietnam_Pro'] mt-2">
                  24.5
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Số lỗi mỗi trận đấu
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-20 flex items-end gap-1 px-4 opacity-40">
                {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#0d631b] rounded-t-md transition-all duration-700 group-hover:bg-[#a3f69c]"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </section>

          {/* Match History Section */}
          <section className="bg-[#f5f3ef] p-8 rounded-[2rem] border border-gray-200/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Be_Vietnam_Pro'] text-2xl font-black text-gray-900">
                Trận đấu đã điều hành gần đây
              </h2>
              <button className="text-[#0d631b] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Xem tất cả lịch sử
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-8 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="col-span-2">Ngày / Giải đấu</div>
                <div className="col-span-4 text-center">Trận đấu</div>
                <div className="col-span-2 text-center">Kết quả</div>
                <div className="col-span-2 text-center">Thẻ vàng</div>
                <div className="col-span-2 text-center">Thẻ đỏ</div>
              </div>

              <MatchRow
                date="24/10/2023"
                league="V-League 1"
                teamA="Hà Nội FC"
                teamB="LPBank HAGL"
                score="2 - 1"
                yellowCards="4"
                redCards="0"
              />
              <MatchRow
                date="18/10/2023"
                league="V-League 1"
                teamA="Nam Định"
                teamB="Viettel FC"
                score="0 - 0"
                yellowCards="2"
                redCards="1"
              />
              <MatchRow
                date="12/10/2023"
                league="Cúp Quốc Gia"
                teamA="Bình Dương"
                teamB="CAHN"
                score="1 - 3"
                yellowCards="6"
                redCards="0"
              />
            </div>
          </section>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.1)] flex justify-around items-center h-20 z-50 border-t border-gray-100">
        {[
          { label: "Leagues", icon: "emoji_events", active: false },
          { label: "Fixtures", icon: "calendar_today", active: false },
          { label: "Referees", icon: "gavel", active: true },
          { label: "Players", icon: "person", active: false },
        ].map((item, i) => (
          <a
            key={i}
            className={`flex flex-col items-center gap-1 ${item.active ? "text-[#0d631b]" : "text-gray-400"}`}
            href="#"
          >
            <span
              className={`material-symbols-outlined ${item.active ? "fill-1" : ""}`}
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] ${item.active ? "font-bold" : "font-medium"}`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default RefereeDetail;
