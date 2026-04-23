import React from "react";

// --- Sub-components để tối ưu code ---

const StatCard = ({ label, value, subtext, icon, bgColor, textColor }: any) => (
  <div
    className={`${bgColor} ${textColor} p-8 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow`}
  >
    <div>
      <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
      <p className="font-['Be_Vietnam_Pro'] font-bold text-lg tracking-wide">{label}</p>
    </div>
    <div>
      <p className="text-5xl font-black font-['Be_Vietnam_Pro'] tracking-tight">{value}</p>
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
  <div className="grid grid-cols-12 items-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
    <div className="col-span-2">
      <p className="text-xs font-bold text-gray-900 tracking-wide">{date}</p>
      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
        {league}
      </p>
    </div>
    <div className="col-span-4 flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-wide">{teamA}</span>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">shield</span>
        </div>
      </div>
      <span className="text-xs font-black text-gray-400 font-['Be_Vietnam_Pro'] tracking-wider">
        VS
      </span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">shield</span>
        </div>
        <span className="text-sm font-bold tracking-wide">{teamB}</span>
      </div>
    </div>
    <div className="col-span-2 text-center">
      <span className="font-['Be_Vietnam_Pro'] font-black text-xl text-gray-900 tracking-tight">
        {score}
      </span>
    </div>
    <div className="col-span-2 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
        <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
        <span className="text-sm font-black tracking-wide">{yellowCards}</span>
      </div>
    </div>
    <div className="col-span-2 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
        <div className="w-2 h-3 bg-red-500 rounded-sm"></div>
        <span className="text-sm font-black tracking-wide">{redCards}</span>
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
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f5] shadow-md flex justify-between items-center px-8 py-4 h-20">
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
            <h2 className="font-['Be_Vietnam_Pro'] font-black text-[#0d631b] text-xl tracking-wide">
              Tactical Hub
            </h2>
            <p className="text-xs font-medium opacity-60 tracking-wide">
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
                  <span className="font-medium tracking-wide">{item}</span>
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
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard
              label="Matches Refereed"
              value="120"
              subtext="Across all leagues"
              icon="sports"
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
            <StatCard
              label="Yellow Cards Issued"
              value="45"
              subtext="This season"
              icon="warning"
              bgColor="bg-yellow-50"
              textColor="text-yellow-700"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RefereeDetail;
