import React from "react";

// --- Sub-components để tối ưu hóa code ---

const AttributeBar = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) => (
  <div
    className="bg-white rounded-xl p-6 border-l-4 shadow-sm"
    style={{ borderLeftColor: colorClass }}
  >
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">
        {label}
      </h4>
      <span className="font-black" style={{ color: colorClass }}>
        {value}%
      </span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${value}%`, backgroundColor: colorClass }}
      ></div>
    </div>
  </div>
);

const FormRow = ({
  status,
  opponent,
  league,
  rating,
}: {
  status: "W" | "D" | "L";
  opponent: string;
  league: string;
  rating: string;
}) => {
  const statusColors = {
    W: "bg-green-600",
    D: "bg-gray-400",
    L: "bg-red-500",
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-full shadow-sm hover:translate-x-1 transition-transform">
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-full ${statusColors[status]} text-white flex items-center justify-center font-bold text-xs shadow-md`}
        >
          {status}
        </span>
        <div className="text-sm">
          <p className="font-bold">với {opponent}</p>
          <p className="text-xs text-gray-400">{league}</p>
        </div>
      </div>
      <span
        className={`font-black ${status === "L" ? "text-red-500" : "text-green-700"}`}
      >
        {rating}
      </span>
    </div>
  );
};

// --- Component Chính ---

const PlayerProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] text-[#1b1c1a]">
      {/* Google Fonts & Icons */}
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
        <div className="text-2xl font-black text-[#2E7D32] tracking-tighter font-['Be_Vietnam_Pro']">
          PitchMaster
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input
              className="bg-gray-100 border-none rounded-full px-6 py-2 w-80 focus:ring-2 focus:ring-[#0d631b] text-sm"
              placeholder="Tìm kiếm cầu thủ..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-gray-400">
              search
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
                alt="Profile"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-5rem)] w-72 rounded-tr-[2rem] sticky top-20 bg-[#f5f3ef] flex flex-col gap-2 p-6 shadow-xl hidden md:flex">
          <div className="mb-8 px-4">
            <h3 className="font-['Be_Vietnam_Pro'] font-black text-[#2E7D32] text-xl">
              Tactical Hub
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Elite Data Insights
            </p>
          </div>
          <nav className="flex flex-col gap-2 flex-grow">
            {["Leagues", "Fixtures", "Results", "Clubs"].map((item, i) => (
              <a
                key={i}
                href="#"
                className="flex items-center gap-4 px-4 py-3 text-gray-700 opacity-70 hover:opacity-100 hover:bg-white/50 rounded-full transition-all"
              >
                <span className="material-symbols-outlined">
                  {
                    ["emoji_events", "calendar_today", "scoreboard", "shield"][
                      i
                    ]
                  }
                </span>
                <span className="font-medium text-sm">{item}</span>
              </a>
            ))}
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-[#2E7D32] to-[#0d631b] text-white rounded-full shadow-lg scale-105"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="font-medium text-sm">Players</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 text-gray-700 opacity-70 hover:opacity-100 hover:bg-white/50 rounded-full transition-all"
            >
              <span className="material-symbols-outlined">gavel</span>
              <span className="font-medium text-sm">Referees</span>
            </a>
          </nav>
          <button className="mt-auto bg-[#0d631b] text-white rounded-full py-4 font-bold shadow-lg hover:brightness-110 transition-all">
            Match Day Live
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-8 max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="relative h-[480px] rounded-[2rem] overflow-hidden shadow-2xl flex items-end group">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
              alt="Player Hero"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            <div className="relative z-10 p-12 flex flex-col md:flex-row md:items-end justify-between w-full gap-8">
              <div className="space-y-3">
                <span className="px-4 py-1.5 bg-green-600 text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
                  Ngôi sao đội tuyển
                </span>
                <h1 className="text-8xl font-black text-white tracking-tighter leading-none font-['Be_Vietnam_Pro']">
                  QUANG HẢI
                </h1>
                <p className="text-white/80 text-xl font-medium">
                  Tiền vệ tấn công | CAHN FC & ĐTQG Việt Nam
                </p>
              </div>

              <div className="flex gap-4">
                {[
                  { label: "Chiều cao", value: "1m68" },
                  { label: "Cân nặng", value: "65kg" },
                  { label: "Quốc tịch", value: "VN" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 text-center min-w-[110px] shadow-xl"
                  >
                    <span className="block text-[10px] text-white/60 font-bold uppercase mb-1 tracking-widest">
                      {stat.label}
                    </span>
                    <span className="text-2xl font-black text-white">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Season Stats */}
            <div className="md:col-span-8 bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black tracking-tight font-['Be_Vietnam_Pro']">
                  Thống kê mùa giải 2023/24
                </h2>
                <button className="text-sm font-bold text-green-700 flex items-center gap-1 hover:underline">
                  Xem chi tiết{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  {
                    label: "Số trận",
                    val: "24",
                    trend: "▲ 2",
                    trendColor: "text-green-600",
                  },
                  {
                    label: "Bàn thắng",
                    val: "12",
                    trend: "Tốt nhất",
                    trendColor: "text-green-600",
                  },
                  {
                    label: "Kiến tạo",
                    val: "08",
                    trend: "Bình quân",
                    trendColor: "text-gray-400",
                  },
                  { label: "Thẻ phạt", isCards: true },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      {stat.label}
                    </span>
                    {stat.isCards ? (
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-5 bg-yellow-400 rounded-sm"></div>
                          <span className="font-bold">2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-5 bg-red-600 rounded-sm"></div>
                          <span className="font-bold">0</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter text-gray-900 font-['Be_Vietnam_Pro']">
                          {stat.val}
                        </span>
                        <span
                          className={`${stat.trendColor} font-bold text-xs whitespace-nowrap`}
                        >
                          {stat.trend}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="mt-16 h-32 w-full flex items-end gap-3 px-2">
                {[40, 65, 95, 55, 80, 45, 60].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-grow rounded-t-xl transition-all duration-500 hover:opacity-80 ${h === 95 ? "bg-green-600 shadow-lg" : "bg-gray-100"}`}
                    style={{ height: `${h}%` }}
                  >
                    {h === 95 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded">
                        MVP
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Form & Insight */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                <h3 className="text-lg font-black mb-6 font-['Be_Vietnam_Pro']">
                  Phong độ 5 trận gần nhất
                </h3>
                <div className="space-y-3">
                  <FormRow
                    status="W"
                    opponent="Nam Định"
                    league="V-League 1"
                    rating="8.4"
                  />
                  <FormRow
                    status="W"
                    opponent="Bình Dương"
                    league="Cúp Quốc Gia"
                    rating="7.9"
                  />
                  <FormRow
                    status="D"
                    opponent="Viettel"
                    league="V-League 1"
                    rating="6.8"
                  />
                  <div className="opacity-50">
                    <FormRow
                      status="L"
                      opponent="Indonesia"
                      league="World Cup Qual."
                      rating="5.5"
                    />
                  </div>
                  <FormRow
                    status="W"
                    opponent="Thanh Hóa"
                    league="V-League 1"
                    rating="7.2"
                  />
                </div>
              </div>

              <div className="bg-green-800 text-white rounded-[2rem] p-8 overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="font-black text-xl mb-3 font-['Be_Vietnam_Pro']">
                    Chuyên gia nhận định
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    Quang Hải đang có sự trở lại ấn tượng với khả năng điều tiết
                    trận đấu tuyệt vời. Chỉ số 'Tạo cơ hội' đã tăng 15% so với
                    tháng trước.
                  </p>
                </div>
                <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] opacity-10 group-hover:rotate-12 transition-transform duration-500">
                  insights
                </span>
              </div>
            </div>

            {/* Tactical Attributes */}
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <AttributeBar
                label="Kỹ năng Chuyền"
                value="92"
                colorClass="#0d631b"
              />
              <AttributeBar
                label="Tầm quan sát"
                value="88"
                colorClass="#4c56af"
              />
              <AttributeBar label="Dứt điểm" value="76" colorClass="#1d622b" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayerProfile;
