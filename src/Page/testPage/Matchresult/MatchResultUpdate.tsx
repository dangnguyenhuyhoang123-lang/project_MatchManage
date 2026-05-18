import React, { useState } from "react";

// --- Types ---
interface GoalEvent {
  id: string;
  player: string;
  minute: number;
  type: "Bàn thắng thường" | "Penalty" | "Phản lưới nhà";
  team: "home" | "away";
}

const MatchResultUpdate: React.FC = ({ onClose }) => {
  const [goals, setGoals] = useState<GoalEvent[]>([
    {
      id: "1",
      player: "Erling Haaland",
      minute: 23,
      type: "Bàn thắng thường",
      team: "home",
    },
    {
      id: "2",
      player: "Bukayo Saka",
      minute: 45,
      type: "Penalty",
      team: "away",
    },
    {
      id: "3",
      player: "Phil Foden",
      minute: 88,
      type: "Bàn thắng thường",
      team: "home",
    },
  ]);

  // Tính toán tỉ số dựa trên danh sách bàn thắng
  const homeScore = goals.filter(
    (g) =>
      (g.team === "home" && g.type !== "Phản lưới nhà") ||
      (g.team === "away" && g.type === "Phản lưới nhà"),
  ).length;
  const awayScore = goals.filter(
    (g) =>
      (g.team === "away" && g.type !== "Phản lưới nhà") ||
      (g.team === "home" && g.type === "Phản lưới nhà"),
  ).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#1b1c1a]/20 backdrop-blur-sm font-sans">
      {/* Main Content */}
      <main className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        <div className="p-8 md:p-10 space-y-10">
          {/* Breadcrumb & Header */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-green-900 uppercase font-['Be_Vietnam_Pro']">
                  Cập nhật kết quả trận đấu
                </h2>
                <p className="text-gray-500 font-medium">
                  Ghi nhận thông số chi tiết của vòng đấu hiện tại
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 rounded-full border border-green-800 text-green-800 font-bold hover:bg-green-50">
                  Lưu nháp
                </button>
                <button className="px-6 py-2 rounded-full bg-green-800 text-white font-bold shadow-lg shadow-green-900/20">
                  Hoàn tất trận đấu
                </button>
              </div>
            </div>
          </div>

          {/* Score Hero Card */}
          <div className="bg-white rounded-2xl p-10 relative overflow-hidden flex items-center justify-between shadow-sm border border-black/5">
            <TeamInfo
              name="Manchester City"
              role="Chủ nhà"
              logo="https://lh3.googleusercontent.com/aida-public/AB6AXuAYr5nzgZRZdMaFizol6jjXyCPgs3GRGQ4hDl5b9LNhpzaMHqpXvJaM6LsfWjNpMJNiuuXOn_2mBvW1u3o4CYQTyctPIfV35JuSiQTErkrpUFAuRnbbQ8PI0A8GLWhIPlX_7p7kM6VkcV5scRjY0WrQRFevHadhGPz4ULBsCgUuIkmX-bOrQQDk_AHHli08rxVwi58wylZ03bbEC3uUozyWk_kVONDG3zd-mgrB3Av0OMk_Mb6CXcuxHZ3O5MqRGjxxqh5J_N0KhQ"
              color="bg-green-50 text-green-700"
            />

            <div className="flex flex-col items-center gap-4 z-10">
              <div className="flex items-center gap-6">
                <input
                  type="number"
                  readOnly
                  value={homeScore}
                  className="w-20 text-center text-5xl font-black bg-gray-100 border-none rounded-xl p-2"
                />
                <span className="text-gray-300 text-4xl">:</span>
                <input
                  type="number"
                  readOnly
                  value={awayScore}
                  className="w-20 text-center text-5xl font-black bg-gray-100 border-none rounded-xl p-2"
                />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-700 font-bold justify-center">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                  <span>Kết thúc Hiệp 2</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Sân vận động Etihad • 14:30, 24 Th05
                </p>
              </div>
            </div>

            <TeamInfo
              name="Arsenal"
              role="Khách"
              logo="https://lh3.googleusercontent.com/aida-public/AB6AXuCU5CjsnOkj-atPPVYK6kKDL2vASAQnmOdzhr7cKGlcctU6dqmy2RXDt9_YUVnB4MG4CJw3zmPmTvfch3qJtL_I4wBPJjepVGo-GjLT0CSiUm5v2Kc5Bx4PBy0UDACBvbIKo20Z6iK3ca6k4M7l9Oqzt49OU1zeEzw00ZbWbrhT6VAsuMPf-aRQ4sl3FAeSlXyBs2SR8ZXih6JfTyb6v8zTHNWibz6dNWAQ7Jew2KOKRhQWhLGc80OKYOj2SzC5k-29k2pZfYoKsQ"
              color="bg-gray-100 text-gray-600"
            />
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-12 gap-10">
            {/* Left: Events & Timeline */}
            <div className="col-span-9 space-y-6">
              <section className="bg-[#f5f3ef] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <span className="material-symbols-outlined fill-1 text-green-700">
                      sports_soccer
                    </span>{" "}
                    Danh sách bàn thắng
                  </h3>
                  <button className="text-green-700 font-bold text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      add_circle
                    </span>{" "}
                    Thêm bàn thắng
                  </button>
                </div>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <GoalRow key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>

              <section className="bg-[#f5f3ef] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-700">
                    timeline
                  </span>{" "}
                  Timeline trận đấu trực quan
                </h3>
                <div className="relative pt-12 pb-16 px-4">
                  <div className="h-1.5 w-full bg-gray-300 rounded-full"></div>
                  {/* Timeline Items */}
                  <TimelineMarker
                    minute={23}
                    label="Haaland"
                    type="goal"
                    team="home"
                  />
                  <TimelineMarker
                    minute={32}
                    label="Thẻ vàng"
                    type="card"
                    color="bg-yellow-400"
                  />
                  <TimelineMarker
                    minute={45}
                    label="Saka"
                    type="goal"
                    team="away"
                    position="50%"
                  />
                  <TimelineMarker
                    minute={88}
                    label="Foden"
                    type="goal"
                    team="home"
                    position="90%"
                  />
                </div>
              </section>
            </div>

            {/* Right: Stats & Notes */}
            <div className="col-span-3 space-y-6">
              <section className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                <h3 className="text-sm font-black text-green-900 uppercase tracking-widest mb-6">
                  Thông số tổng quan
                </h3>
                <div className="space-y-6">
                  <StatBar label="Kiểm soát" homeVal={58} awayVal={42} />
                  <StatRow label="Sút bóng" homeVal={12} awayVal={8} />
                  <StatRow label="Phạm lỗi" homeVal={6} awayVal={9} />
                  <StatRow label="Phạt góc" homeVal={5} awayVal={4} last />
                </div>
              </section>

              <section className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-green-800 mb-4 uppercase">
                  Ghi chú trận đấu
                </h3>
                <textarea
                  className="w-full h-32 bg-white border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-green-800 mb-4"
                  placeholder="Nhập nhận định chuyên môn..."
                ></textarea>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-green-800 font-bold text-sm shadow-sm border border-green-100">
                  <span className="material-symbols-outlined text-sm">
                    print
                  </span>{" "}
                  Xuất biên bản trận đấu
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const NavItem = ({ icon, label, active = false }: any) => (
  <a
    className={`flex items-center gap-3 px-4 py-3 transition-all rounded-full ${active ? "bg-white text-green-800 font-bold shadow-sm" : "text-gray-500 hover:text-green-700"}`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

const TeamInfo = ({ name, role, logo, color }: any) => (
  <div className="flex flex-col items-center gap-4 w-1/3 z-10">
    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-gray-50">
      <img src={logo} alt={name} className="w-16 h-16 object-contain" />
    </div>
    <span className="text-xl font-black text-green-900 font-['Be_Vietnam_Pro']">
      {name}
    </span>
    <span
      className={`${color} px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}
    >
      {role}
    </span>
  </div>
);

const GoalRow = ({ goal }: { goal: GoalEvent }) => (
  <div
    className={`bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm ${goal.team === "away" ? "border-l-4 border-indigo-500" : ""}`}
  >
    <div
      className={`w-10 h-10 ${goal.team === "home" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"} flex items-center justify-center rounded-full`}
    >
      <span className="material-symbols-outlined fill-1">sports_soccer</span>
    </div>
    <div className="flex-1 grid grid-cols-3 gap-4">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Cầu thủ
        </p>
        <p className="text-sm font-bold">{goal.player}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Thời điểm
        </p>
        <p className="text-sm font-bold">{goal.minute}'</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Loại bàn thắng
        </p>
        <p className="text-sm font-bold">{goal.type}</p>
      </div>
    </div>
    <button className="text-gray-300 hover:text-red-500">
      <span className="material-symbols-outlined">delete</span>
    </button>
  </div>
);

const TimelineMarker = ({
  minute,
  label,
  type,
  color = "bg-green-600",
  team,
  position,
}: any) => {
  const leftPos = position || `${(minute / 90) * 100}%`;
  return (
    <div
      className="absolute top-12 -translate-x-1/2 flex flex-col items-center"
      style={{ left: leftPos }}
    >
      <div
        className={`w-0.5 ${type === "goal" ? "h-10" : "h-6"} ${team === "away" ? "bg-indigo-500" : "bg-green-600"} mb-1`}
      ></div>
      {type === "goal" ? (
        <div
          className={`w-8 h-8 rounded-full ${team === "away" ? "bg-indigo-500" : "bg-green-600"} flex items-center justify-center text-white shadow-lg`}
        >
          <span className="material-symbols-outlined text-xs fill-1">
            sports_soccer
          </span>
        </div>
      ) : (
        <div
          className={`w-5 h-7 rounded-sm ${color} border border-yellow-600 shadow-sm`}
        ></div>
      )}
      <span className="text-[10px] font-bold mt-1 whitespace-nowrap">
        {label} {minute}'
      </span>
    </div>
  );
};

const StatBar = ({ label, homeVal, awayVal }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-bold font-['Be_Vietnam_Pro']">
      <span className="text-green-700">MC {homeVal}%</span>
      <span className="text-gray-400">{label}</span>
      <span className="text-indigo-600">ARS {awayVal}%</span>
    </div>
    <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
      <div className="bg-green-600" style={{ width: `${homeVal}%` }}></div>
      <div className="bg-indigo-500" style={{ width: `${awayVal}%` }}></div>
    </div>
  </div>
);

const StatRow = ({ label, homeVal, awayVal, last = false }: any) => (
  <div
    className={`flex items-center justify-between py-2 ${last ? "" : "border-b border-gray-50"}`}
  >
    <span className="text-xl font-black text-green-700">{homeVal}</span>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
      {label}
    </span>
    <span className="text-xl font-black text-indigo-600">{awayVal}</span>
  </div>
);

export default MatchResultUpdate;
