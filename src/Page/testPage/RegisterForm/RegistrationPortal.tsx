import React, { useState } from "react";

// --- Interface & Mock Data ---
interface Club {
  id: string;
  name: string;
  stadium: string;
  squadCount: number;
  status: string;
  logo: string;
}

const CLUBS: Club[] = [
  {
    id: "1",
    name: "Hà Nội FC",
    stadium: "Sân vận động Hàng Đẫy",
    squadCount: 28,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=HNFC",
  },
  {
    id: "2",
    name: "Công An Hà Nội",
    stadium: "Sân vận động Mỹ Đình",
    squadCount: 30,
    status: "Đương kim vô địch",
    logo: "https://placehold.co/100x100?text=CAHN",
  },
  {
    id: "3",
    name: "Thể Công Viettel",
    stadium: "Sân vận động Mỹ Đình",
    squadCount: 26,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=TCV",
  },
  {
    id: "4",
    name: "LPBank HAGL",
    stadium: "Sân vận động Pleiku",
    squadCount: 25,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=HAGL",
  },
  {
    id: "5",
    name: "Hải Phòng FC",
    stadium: "Sân vận động Lạch Tray",
    squadCount: 24,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=HPFC",
  },
  {
    id: "6",
    name: "B.Bình Dương",
    stadium: "Sân vận động Gò Đậu",
    squadCount: 29,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=BBD",
  },
];

// --- Sub-components ---

const ClubCard = ({
  club,
  isSelected,
  onSelect,
}: {
  club: Club;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`group relative bg-white rounded-2xl p-6 flex flex-col gap-4 border-2 transition-all cursor-pointer hover:-translate-y-1 ${
      isSelected
        ? "border-green-600 ring-4 ring-green-600/5 shadow-xl"
        : "border-transparent shadow-sm hover:shadow-lg"
    }`}
  >
    <div className="flex justify-between items-start">
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center p-3">
        <img
          src={club.logo}
          alt={club.name}
          className="w-full h-full object-contain"
        />
      </div>
      <span
        className={`material-symbols-outlined text-3xl transition-opacity ${isSelected ? "text-green-600 opacity-100" : "text-gray-200 opacity-0 group-hover:opacity-100"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{club.name}</h3>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
        <span className="material-symbols-outlined text-base">stadium</span>
        <span>{club.stadium}</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
          {club.squadCount} Cầu thủ
        </span>
        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
          {club.status}
        </span>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

const RegistrationPortal: React.FC = () => {
  const [selectedClubId, setSelectedClubId] = useState<string | null>("2");

  const selectedClub = CLUBS.find((c) => c.id === selectedClubId);

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] flex">
      {/* Google Fonts & Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        rel="stylesheet"
      />

      {/* Sidebar - Tương tự phong cách các trang trước */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#f5f3ef] flex flex-col p-6 gap-2 border-r border-gray-200 z-50">
        <div className="flex flex-col gap-1 mb-8 px-2">
          <span className="text-xl font-black text-[#0d631b] font-['Be_Vietnam_Pro']">
            Registration Portal
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Season 2024/25
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a
            className="flex items-center gap-3 bg-white text-green-700 rounded-full px-4 py-3 shadow-sm font-semibold text-sm"
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
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* TopBar */}
        <header className="sticky top-0 bg-[#fbf9f5]/80 backdrop-blur-md z-40 px-8 py-4 flex justify-between items-center border-b border-gray-100">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-600/20"
              placeholder="Tìm kiếm câu lạc bộ..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-10 w-10 rounded-full border border-green-200 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
                alt="Manager"
              />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-green-700">
              Trang chủ
            </a>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-gray-900">Chọn Câu lạc bộ</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3 font-['Be_Vietnam_Pro']">
              Đăng ký thi đấu - Bước 1
            </h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed">
              Vui lòng lựa chọn câu lạc bộ bạn muốn đại diện trong mùa giải
              2024/25. Sau khi chọn, bạn sẽ tiếp tục đến bước lập danh sách thi
              đấu.
            </p>
          </div>

          {/* Stepper Custom */}
          <div className="mb-16 flex items-center justify-between max-w-3xl mx-auto relative">
            <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-200 -z-10"></div>
            {[
              { step: 1, label: "Chọn CLB", active: true },
              { step: 2, label: "Danh sách cầu thủ", active: false },
              { step: 3, label: "Kiểm tra & Xác nhận", active: false },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ring-8 ring-[#fbf9f5] ${s.active ? "bg-green-700 text-white shadow-xl shadow-green-700/20" : "bg-gray-200 text-gray-400"}`}
                >
                  {s.step}
                </div>
                <span
                  className={`text-xs font-bold ${s.active ? "text-green-700" : "text-gray-400"}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {CLUBS.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isSelected={selectedClubId === club.id}
                onSelect={() => setSelectedClubId(club.id)}
              />
            ))}
          </div>

          {/* Floating Action Footer */}
          <div className="fixed bottom-8 left-64 right-0 flex justify-center px-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
              <div className="flex items-center gap-4 pl-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-700">
                    info
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedClub?.name || "Chưa chọn CLB"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Đã chọn để đăng ký
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
                  Hủy bỏ
                </button>
                <button
                  className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
                  disabled={!selectedClubId}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPortal;
