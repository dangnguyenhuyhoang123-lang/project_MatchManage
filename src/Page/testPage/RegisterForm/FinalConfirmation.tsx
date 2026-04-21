import React, { useState } from "react";

// --- Interfaces ---
interface PlayerSummary {
  id: string;
  name: string;
  position: string;
  number: number;
  dob: string;
  idCard: string;
  image: string;
}

const TOP_PLAYERS: PlayerSummary[] = [
  {
    id: "1",
    name: "Nguyễn Văn Quyết",
    position: "Tiền đạo",
    number: 10,
    dob: "01/07/1991",
    idCard: "001091******",
    image: "https://placehold.co/100x100?text=VQ10",
  },
  {
    id: "2",
    name: "Phạm Tuấn Hải",
    position: "Tiền đạo",
    number: 9,
    dob: "19/05/1998",
    idCard: "001098******",
    image: "https://placehold.co/100x100?text=TH09",
  },
];

const FinalConfirmation: React.FC = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] flex">
      {/* Styles & Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        rel="stylesheet"
      />

      {/* Sidebar - Consistent with previous pages */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#f5f3ef] flex flex-col p-6 gap-2 border-r border-gray-200 z-50">
        <div className="flex flex-col gap-1 mb-8 px-2">
          <span className="text-xl font-black text-[#0d631b] font-['Be_Vietnam_Pro']">
            Tactical Manager
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Season 2024/25
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <a
            className="flex items-center gap-3 bg-white text-[#0d631b] rounded-full px-4 py-3 shadow-sm font-semibold text-sm transition-all translate-x-1"
            href="#"
          >
            <span className="material-symbols-outlined">assignment</span>{" "}
            Registration
          </a>
          {["Clubs", "Roster", "Analytics"].map((item, i) => (
            <a
              key={i}
              className="flex items-center gap-3 text-gray-500 px-4 py-3 hover:bg-white/50 rounded-full transition-colors text-sm font-medium"
              href="#"
            >
              <span className="material-symbols-outlined">
                {["sports_soccer", "groups", "leaderboard"][i]}
              </span>{" "}
              {item}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button className="w-full bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white rounded-full py-3 px-4 font-bold text-sm shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">add</span> New
            Entry
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col pt-20">
        <div className="max-w-5xl mx-auto p-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-semibold uppercase tracking-wider">
            <span>Trang chủ</span>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span>Đăng ký thi đấu</span>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-[#0d631b]">Kiểm tra & Xác nhận</span>
          </nav>

          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 font-['Be_Vietnam_Pro']">
              Đăng ký thi đấu - Bước 3
            </h1>
            <p className="text-gray-500 text-lg">
              Vui lòng rà soát lại toàn bộ thông tin trước khi gửi đơn đăng ký
              chính thức.
            </p>
          </header>

          {/* Stepper Display */}
          <div className="flex items-center justify-between mb-10 bg-[#f5f3ef] p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 text-[#0d631b] flex items-center justify-center border border-green-200">
                <span className="material-symbols-outlined">check</span>
              </div>
              <span className="font-bold text-gray-500">1. Chọn CLB</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-6"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 text-[#0d631b] flex items-center justify-center border border-green-200">
                <span className="material-symbols-outlined">check</span>
              </div>
              <span className="font-bold text-gray-500">
                2. Danh sách cầu thủ
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-6"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0d631b] text-white flex items-center justify-center font-bold shadow-lg shadow-green-900/30">
                3
              </div>
              <span className="font-bold text-[#0d631b]">
                3. Kiểm tra & Xác nhận
              </span>
            </div>
          </div>

          {/* Bento Summary Section */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Club Info */}
            <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <span
                className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-gray-50 opacity-10"
                style={{ fontSize: "160px" }}
              >
                stadium
              </span>
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                Thông tin CLB
              </h2>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-[#f5f3ef] flex items-center justify-center p-3 border border-gray-200">
                  <img
                    src="https://placehold.co/100x100?text=HNFC"
                    alt="Hà Nội FC"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">
                    Hà Nội FC
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    <span className="font-medium">Sân vận động Hàng Đẫy</span>
                  </div>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-50 text-[#0d631b] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Hạng Nhất Quốc Gia
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="col-span-12 lg:col-span-5 bg-[#4c56af] p-8 rounded-2xl shadow-sm flex flex-col justify-between text-white">
              <h2 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-6">
                Thống kê đội hình
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { v: "25", l: "Cầu thủ" },
                  { v: "05", l: "Cán bộ" },
                  { v: "03", l: "Thủ môn" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-4xl font-black">{stat.v}</p>
                    <p className="text-[10px] font-bold opacity-70 uppercase">
                      {stat.l}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-medium">Trạng thái hồ sơ</span>
                <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase">
                  Hoàn tất 100%
                </span>
              </div>
            </div>
          </div>

          {/* Player List Summary */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Danh sách cầu thủ tiêu biểu
                </h2>
                <p className="text-gray-500 text-sm">
                  Hiển thị 5 cầu thủ vừa cập nhật hồ sơ
                </p>
              </div>
              <button className="text-[#0d631b] font-bold text-sm flex items-center gap-1 hover:underline">
                Xem toàn bộ danh sách{" "}
                <span className="material-symbols-outlined text-sm">
                  open_in_new
                </span>
              </button>
            </div>

            <div className="space-y-3">
              {TOP_PLAYERS.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-100"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{player.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {player.position} • Số {player.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                      Ngày sinh
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {player.dob}
                    </p>
                  </div>
                  <div className="flex-1 hidden md:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                      Số CCCD
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {player.idCard}
                    </p>
                  </div>
                  <div className="bg-green-50 text-[#0d631b] px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0d631b]"></div>
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Hợp lệ
                    </span>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-white/50 rounded-xl border border-dashed border-gray-200 flex items-center gap-4 opacity-60">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-sm font-bold italic text-gray-500">
                  ... và 23 cầu thủ khác đã được xác thực
                </span>
              </div>
            </div>
          </div>

          {/* Commitment Section */}
          <div className="bg-[#efeeea] p-8 rounded-2xl mb-12 border border-gray-200">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="commit"
                checked={isConfirmed}
                onChange={() => setIsConfirmed(!isConfirmed)}
                className="w-6 h-6 mt-1 rounded border-gray-300 text-[#0d631b] focus:ring-[#0d631b]/20 cursor-pointer"
              />
              <label htmlFor="commit" className="cursor-pointer">
                <h3 className="font-bold text-gray-900 text-lg mb-1 font-['Be_Vietnam_Pro']">
                  Cam kết & Quy định
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Tôi xác nhận rằng tất cả thông tin khai báo trên đây là chính
                  xác và trung thực. Tôi đã đọc và đồng ý tuân thủ các quy định,
                  điều lệ của giải đấu do Ban tổ chức ban hành. Mọi sai sót hoặc
                  thông tin giả mạo sẽ dẫn đến việc loại hồ sơ đăng ký mà không
                  cần thông báo trước.
                </p>
              </label>
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button className="px-8 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>{" "}
              Quay lại
            </button>
            <button
              disabled={!isConfirmed}
              className={`px-12 py-4 rounded-full font-black text-lg shadow-xl flex items-center gap-3 transition-all active:scale-95 ${
                isConfirmed
                  ? "bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white shadow-green-900/30"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              Gửi đơn đăng ký{" "}
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white flex items-center gap-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#0d631b]">
            <span className="material-symbols-outlined font-bold">
              verified
            </span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Hồ sơ sẵn sàng</h4>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              Dữ liệu đã được kiểm tra tự động
            </p>
          </div>
          <button className="ml-4 text-gray-400 hover:text-gray-900">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalConfirmation;
