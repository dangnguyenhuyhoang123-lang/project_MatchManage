import React from "react";

export default function DashBoardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f5f3ef] p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-green-700">PitchPro</h1>
          <p className="text-xs opacity-60">Elite Management</p>
        </div>

        <nav className="space-y-2 text-sm">
          {[
            "Dashboard",
            "Tournaments",
            "Rounds",
            "Clubs",
            "Players",
            "Registration",
            "Schedule",
            "Results",
            "Standings",
            "Reports",
          ].map((item, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-full cursor-pointer ${
                i === 0
                  ? "bg-white text-green-700 font-bold shadow-sm"
                  : "opacity-70"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <input
            placeholder="Tìm kiếm..."
            className="bg-gray-100 px-4 py-2 rounded-full w-72"
          />
          <div className="text-sm">Admin Tactical</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold">Bảng Điều Khiển Tổng Quan</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Số giải đấu", value: "3" },
            { label: "Số CLB", value: "20" },
            { label: "Số cầu thủ", value: "500+" },
            { label: "Trận đã đá", value: "120" },
            { label: "Bàn thắng", value: "342" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border">
              <p className="text-xs opacity-60">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts + Ranking (FIXED) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm">
            <h4 className="font-bold mb-4">Xu hướng bàn thắng</h4>
            <div className="h-40 flex items-end gap-2">
              {[30, 45, 40, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="bg-green-600 w-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Top CLB */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm">
            <h4 className="font-bold mb-4">Top 5 CLB</h4>
            {[95, 88, 82, 75].map((v, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span>CLB {i + 1}</span>
                  <span>{v}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-600 rounded"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matches + Notifications (FIXED) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matches */}
          <div className="lg:col-span-8">
            <h4 className="font-bold mb-3">Trận đấu sắp diễn ra</h4>
            <div className="space-y-2">
              {["Saigon vs Dragon", "Blue vs Ocean", "Red vs Phoenix"].map(
                (m, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-lg flex justify-between shadow-sm"
                  >
                    <span>{m}</span>
                    <span className="text-green-600">19:00</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="lg:col-span-4">
            <h4 className="font-bold mb-3">Thông báo</h4>
            <div className="space-y-2">
              {["Cập nhật lịch", "Kỷ luật cầu thủ"].map((n, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
