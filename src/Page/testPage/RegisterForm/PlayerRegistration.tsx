import React, { useState } from "react";

// --- Interfaces ---
interface Player {
  id: string;
  name: string;
  role: "GK" | "DF" | "MF" | "FW";
  age: number;
  type: string;
  avatar: string;
  isValid: boolean;
  error?: string;
}

const INITIAL_PLAYERS: Player[] = [
  {
    id: "1",
    name: "Nguyễn Văn Hoàng",
    role: "GK",
    age: 24,
    type: "Chuyên nghiệp",
    avatar: "https://placehold.co/100x100?text=GK",
    isValid: true,
  },
  {
    id: "2",
    name: "Phạm Minh Đức",
    role: "DF",
    age: 27,
    type: "Chuyên nghiệp",
    avatar: "https://placehold.co/100x100?text=DF",
    isValid: true,
  },
  {
    id: "3",
    name: "Trần Thái Dương",
    role: "MF",
    age: 20,
    type: "Năng khiếu",
    avatar: "https://placehold.co/100x100?text=MF",
    isValid: false,
    error: "Cần bổ sung CMND/CCCD",
  },
  {
    id: "4",
    name: "Lê Quang Vinh",
    role: "FW",
    age: 22,
    type: "U23",
    avatar: "https://placehold.co/100x100?text=FW",
    isValid: true,
  },
];

const PlayerRegistration: React.FC = ({ setStep }) => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const mainPlayers = players.slice(0, 11);
  const subPlayers = players.slice(11);

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  return (
    <>
      {/* Main Content */}

      {/* Warning Banner */}
      <div className="bg-[#fff9c4]/40 border border-[#fbc02d]/30 p-5 rounded-xl mb-8 flex items-start gap-4">
        <span className="material-symbols-outlined text-[#f57f17] text-2xl">
          warning
        </span>
        <div>
          <h3 className="font-bold text-[#f57f17] text-sm">
            Cần bổ sung cầu thủ
          </h3>
          <p className="text-[#f57f17]/80 text-xs mt-1">
            Danh sách hiện có <span className="font-bold">14/18</span> cầu thủ.
            Cần thêm ít nhất 4 cầu thủ. Thời hạn còn{" "}
            <span className="font-bold text-red-600">3 ngày</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main List Section */}
        <div className="col-span-12 xl:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Đội hình Chính thức{" "}
              <span className="font-normal text-sm text-gray-400 ml-2">
                (11 cầu thủ)
              </span>
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#0d631b] text-xs font-bold rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-sm">
                person_add
              </span>{" "}
              Thêm mới
            </button>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between bg-white p-4 rounded-xl border transition-all hover:scale-[1.01] ${!player.isValid ? "border-red-200 border-l-4 border-l-red-500" : "border-gray-100"}`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-12 h-12 rounded-lg bg-gray-100"
                  />
                  <div>
                    <h4
                      className={`font-bold ${!player.isValid ? "text-red-600" : "text-gray-900"}`}
                    >
                      {player.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold rounded ${player.role === "GK" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {player.role}
                      </span>
                      <span
                        className={`text-[11px] ${!player.isValid ? "text-red-500 font-semibold" : "text-gray-400"}`}
                      >
                        {player.error || `${player.age} tuổi • ${player.type}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`material-symbols-outlined ${player.isValid ? "text-[#0d631b]" : "text-red-500"}`}
                  >
                    {player.isValid ? "check_circle" : "error"}
                  </span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="material-symbols-outlined text-gray-300 hover:text-red-500 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
            <div className="border-2 border-dashed border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-[#0d631b]/30 cursor-pointer transition-all">
              <span className="material-symbols-outlined text-3xl mb-1">
                add_circle
              </span>
              <p className="text-xs font-bold">
                Kéo thả hoặc nhấn để thêm cầu thủ
              </p>
            </div>
          </div>
        </div>

        {/* Validation & Subs Section */}
        {/* RIGHT SIDE */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          {/* ĐỘI HÌNH DỰ BỊ */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Đội hình Dự bị{" "}
                <span className="font-normal text-sm text-gray-400 ml-2">
                  ({subPlayers.length}/7 cầu thủ)
                </span>
              </h3>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-2xl border border-gray-200 space-y-3">
              {subPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-white/80 p-3 rounded-lg shadow-sm border border-white"
                >
                  <img
                    src={player.avatar}
                    className="w-10 h-10 rounded-full bg-gray-100"
                    alt="avatar"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-[#4c56af] font-bold uppercase">
                      {player.role} • {player.age} tuổi
                    </p>
                  </div>

                  {/* icon giống UI */}
                  <button className="text-gray-400 hover:text-[#0d631b] transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      swap_horiz
                    </span>
                  </button>
                </div>
              ))}

              {/* placeholder giống UI */}
              {subPlayers.length < 7 && (
                <div className="p-3 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 text-[11px] italic bg-white/20">
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Còn trống {7 - subPlayers.length} vị trí dự bị
                </div>
              )}
            </div>
          </section>

          {/* CARD VALIDATION */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>{" "}
              Kiểm tra tính hợp lệ
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500">
                  cancel
                </span>
                <div>
                  <p className="text-sm font-bold">Số lượng tối thiểu</p>
                  <p className="text-[11px] text-gray-400">14/18 cầu thủ</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0d631b]">
                  check_circle
                </span>
                <div>
                  <p className="text-sm font-bold">Độ tuổi hợp lệ</p>
                  <p className="text-[11px] text-gray-400">Tất cả hợp lệ</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500">
                  error
                </span>
                <div>
                  <p className="text-sm font-bold">Hồ sơ</p>
                  <p className="text-[11px] text-gray-400">
                    1 cầu thủ thiếu CCCD
                  </p>
                </div>
              </li>
            </ul>

            {/* progress */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">65%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0d631b]" style={{ width: "65%" }} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          {/* INFO */}
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                groups
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {players.length}/18 cầu thủ
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Danh sách hiện tại
              </p>
            </div>
          </div>

          {/* ACTION */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Quay lại
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={players.length < 14} // optional validate
              className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerRegistration;
