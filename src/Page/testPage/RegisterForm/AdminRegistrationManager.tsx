import React, { useState } from "react";

// --- Interfaces ---
interface RegistrationRequest {
  id: string;
  clubName: string;
  clubLogo: string;
  tournament: string;
  submissionDate: string;
  playerCount: number;
  status: "pending" | "approved" | "rejected";
}

const REGISTRATION_DATA: RegistrationRequest[] = [
  {
    id: "REG-9021",
    clubName: "CLB Hà Nội",
    clubLogo: "https://placehold.co/40x40?text=HN",
    tournament: "V-League 2024/25",
    submissionDate: "12/05/2024",
    playerCount: 28,
    status: "pending",
  },
  {
    id: "REG-8954",
    clubName: "CLB Công An Hà Nội",
    clubLogo: "https://placehold.co/40x40?text=CAHN",
    tournament: "V-League 2024/25",
    submissionDate: "11/05/2024",
    playerCount: 32,
    status: "pending",
  },
  {
    id: "REG-8822",
    clubName: "CLB Hải Phòng",
    clubLogo: "https://placehold.co/40x40?text=HP",
    tournament: "Cúp Quốc gia 2024",
    submissionDate: "10/05/2024",
    playerCount: 25,
    status: "approved",
  },
  {
    id: "REG-8750",
    clubName: "CLB Nam Định",
    clubLogo: "https://placehold.co/40x40?text=NĐ",
    tournament: "V-League 2024/25",
    submissionDate: "08/05/2024",
    playerCount: 29,
    status: "rejected",
  },
];

const AdminRegistrationManager: React.FC = () => {
  const [requests] = useState<RegistrationRequest[]>(REGISTRATION_DATA);

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] font-['Inter']">
      {/* External Assets */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <aside className="w-72 fixed h-full bg-[#f5f3ef] border-r border-gray-200 p-8 flex flex-col font-['Be_Vietnam_Pro']">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0d631b] rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">
              sports_soccer
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0d631b] tracking-tighter">
              PitchManager
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { name: "Tổng quan", icon: "dashboard" },
            { name: "Đơn đăng ký", icon: "description", active: true },
            { name: "Đội bóng", icon: "groups" },
            { name: "Lịch thi đấu", icon: "event" },
            { name: "Cài đặt", icon: "settings" },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-4 px-6 py-3 rounded-full transition-all text-sm font-semibold ${
                item.active
                  ? "bg-white text-[#0d631b] shadow-sm"
                  : "text-gray-500 hover:bg-white/50"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <button className="mt-auto w-full bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white rounded-full py-4 font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add_circle</span>
          Tạo giải đấu mới
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 font-['Be_Vietnam_Pro']">
              Đơn đăng ký tham gia
            </h2>
            <p className="text-gray-500 text-sm">
              Xem xét và phê duyệt hồ sơ đăng ký thi đấu của các câu lạc bộ.
            </p>
          </div>
          <div className="flex bg-gray-200/50 p-1 rounded-full">
            <button className="px-6 py-2 bg-white text-[#0d631b] font-bold rounded-full shadow-sm text-xs">
              Đang chờ duyệt (12)
            </button>
            <button className="px-6 py-2 text-gray-500 font-bold text-xs">
              Đã phê duyệt
            </button>
            <button className="px-6 py-2 text-gray-500 font-bold text-xs">
              Đã từ chối
            </button>
          </div>
        </header>

        {/* Filters & Stats */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-9 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-end gap-6">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Giải đấu
              </label>
              <select className="w-full bg-[#f5f3ef] border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0d631b]">
                <option>V-League 2024/25</option>
                <option>Hạng Nhất Quốc gia</option>
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Mùa giải
              </label>
              <select className="w-full bg-[#f5f3ef] border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0d631b]">
                <option>Giai đoạn 1</option>
                <option>Giai đoạn 2</option>
              </select>
            </div>
            <button className="px-8 py-3 bg-[#f5f3ef] text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all">
              Áp dụng bộ lọc
            </button>
          </div>

          <div className="col-span-3 bg-[#0d631b]/5 border border-[#0d631b]/10 p-6 rounded-2xl flex flex-col justify-center">
            <p className="text-[10px] font-black text-[#0d631b] uppercase tracking-widest mb-1">
              Tỷ lệ duyệt nhanh
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0d631b]">84%</span>
              <span className="text-[10px] text-green-600 font-bold">
                +2.4% tuần này
              </span>
            </div>
          </div>
        </div>

        {/* Request Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="col-span-1">Mã đơn</div>
            <div className="col-span-3">Câu lạc bộ</div>
            <div className="col-span-2">Giải đấu</div>
            <div className="col-span-2 text-center">Ngày nộp</div>
            <div className="col-span-1 text-center">Cầu thủ</div>
            <div className="col-span-1 text-center">Trạng thái</div>
            <div className="col-span-2 text-right">Hành động</div>
          </div>

          {/* Table Rows */}
          {requests.map((req) => (
            <div
              key={req.id}
              className="grid grid-cols-12 items-center px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="col-span-1 text-xs font-bold text-gray-400">
                #{req.id.split("-")[1]}
              </div>
              <div className="col-span-3 flex items-center gap-3">
                <img
                  src={req.clubLogo}
                  alt={req.clubName}
                  className="w-10 h-10 rounded-lg bg-gray-50 object-contain"
                />
                <span className="font-bold text-gray-900">{req.clubName}</span>
              </div>
              <div className="col-span-2 text-sm text-gray-500 font-medium">
                {req.tournament}
              </div>
              <div className="col-span-2 text-center text-sm text-gray-500">
                {req.submissionDate}
              </div>
              <div className="col-span-1 text-center font-black text-gray-900">
                {req.playerCount}
              </div>
              <div className="col-span-1 flex justify-center">
                <span
                  className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                    req.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {req.status === "pending"
                    ? "Chờ duyệt"
                    : req.status === "approved"
                      ? "Đã duyệt"
                      : "Bị từ chối"}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  disabled={req.status !== "pending"}
                  className="p-2 text-[#0d631b] hover:bg-green-50 rounded-full transition-colors disabled:opacity-20"
                >
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                </button>
                <button
                  disabled={req.status !== "pending"}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-20"
                >
                  <span className="material-symbols-outlined">cancel</span>
                </button>
                <button className="ml-2 px-4 py-2 bg-[#f5f3ef] text-gray-900 font-bold text-xs rounded-xl hover:bg-gray-200 transition-all">
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-between items-center px-4">
          <p className="text-xs text-gray-400 font-bold">
            Hiển thị <span className="text-gray-900">4</span> trên{" "}
            <span className="text-gray-900">48</span> đơn đăng ký
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, "...", 12].map((page, i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                  page === 1
                    ? "bg-[#0d631b] text-white shadow-lg"
                    : "bg-white text-gray-400 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRegistrationManager;
