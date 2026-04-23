import React, { useState } from "react";
import { Sidebar } from "../../../utils/SideBar";
import { Modal } from "../../../components/Modal";
import CreateRoundModal from "./CreateRoundModal";

interface RoundData {
  id: string;
  name: string;
  league: string;
  season: string;
  date: string;
  time: string;
  status: "ongoing" | "completed" | "upcoming";
  colorClass: string;
}

const RoundManagement: React.FC = () => {
  const [open, setOpen] = useState(false);

  const [rounds] = useState<RoundData[]>([
    {
      id: "12",
      name: "Vòng đấu 12",
      league: "V-League 1",
      season: "2024",
      date: "15/05/2024",
      time: "19:00 GMT+7",
      status: "ongoing",
      colorClass: "bg-green-100 text-[#0d631b]",
    },
    {
      id: "11",
      name: "Vòng đấu 11",
      league: "V-League 1",
      season: "2024",
      date: "08/05/2024",
      time: "18:00 GMT+7",
      status: "completed",
      colorClass: "bg-zinc-100 text-zinc-400",
    },
    {
      id: "05",
      name: "Tứ kết Lượt đi",
      league: "Cúp Quốc Gia",
      season: "2024",
      date: "20/05/2024",
      time: "20:00 GMT+7",
      status: "upcoming",
      colorClass: "bg-blue-100 text-blue-700",
    },
    {
      id: "13",
      name: "Vòng đấu 13",
      league: "V-League 1",
      season: "2024",
      date: "22/05/2024",
      time: "19:15 GMT+7",
      status: "upcoming",
      colorClass: "bg-green-100 text-[#0d631b]",
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] text-[#1b1c1a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 max-w-7xl mx-auto space-y-8">
        <div className="w-full max-w-[1400px] space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-2 font-medium">
                <span>Quản lý Giải đấu</span>
                <span>{">"}</span>
                <span className="text-zinc-600">Vòng đấu</span>
              </nav>

              <h1 className="text-2xl md:text-4xl font-extrabold flex flex-wrap items-center gap-2">
                Quản lý Vòng đấu
                <span className="px-3 py-1 bg-green-100 text-[#0d631b] text-xs rounded-full font-bold">
                  Season 2024
                </span>
              </h1>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="bg-[#0d631b] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-[1.02] transition"
            >
              + Tạo vòng đấu
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 bg-zinc-50 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4">
              <select className="flex-1 p-3 rounded-lg shadow-sm">
                <option>V-League 1</option>
                <option>Cúp Quốc Gia</option>
              </select>

              <select className="flex-1 p-3 rounded-lg shadow-sm">
                <option>2024</option>
                <option>2025</option>
              </select>

              <button className="p-3 bg-white rounded-lg shadow-sm">⚙️</button>
            </div>

            <div className="lg:col-span-4 bg-[#4c56af] text-white rounded-xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs opacity-80">Thống kê nhanh</p>
                <h3 className="text-2xl font-bold">24 Vòng đấu</h3>
              </div>
              <p className="text-xs opacity-60">Cập nhật hôm nay</p>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden lg:grid grid-cols-12 px-6 py-2 text-xs font-bold text-zinc-400">
              <div className="col-span-4">Thông tin</div>
              <div className="col-span-2">Giải</div>
              <div className="col-span-2 text-center">Thời gian</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Hành động</div>
            </div>

            {/* Rows */}
            {rounds.map((round) => (
              <div
                key={round.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-0 bg-white p-5 rounded-xl shadow-sm"
              >
                <div className="lg:col-span-4 flex gap-3 items-center">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center font-bold ${round.colorClass}`}
                  >
                    {round.id}
                  </div>
                  <div>
                    <p className="font-semibold">{round.name}</p>
                    <p className="text-xs text-gray-400">Mùa {round.season}</p>
                  </div>
                </div>

                <div className="lg:col-span-2 text-sm">{round.league}</div>

                <div className="lg:col-span-2 text-sm text-center">
                  <p>{round.date}</p>
                  <p className="text-xs text-gray-400">{round.time}</p>
                </div>

                <div className="lg:col-span-2 flex justify-center">
                  {round.status === "ongoing" && (
                    <span className="text-green-600 text-xs font-bold">
                      Đang diễn ra
                    </span>
                  )}
                  {round.status === "completed" && (
                    <span className="text-gray-400 text-xs font-bold">
                      Đã xong
                    </span>
                  )}
                  {round.status === "upcoming" && (
                    <span className="text-blue-600 text-xs font-bold">
                      Sắp diễn ra
                    </span>
                  )}
                </div>

                <div className="lg:col-span-2 flex justify-end gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded">✏️</button>
                  <button className="p-2 hover:bg-red-100 rounded">🗑</button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-100 p-6 rounded-xl">
              <h4 className="font-bold mb-2">Tối ưu lịch</h4>
              <p className="text-sm text-gray-600">
                AI hỗ trợ sắp xếp lịch thi đấu.
              </p>
            </div>

            <div className="bg-green-700 text-white p-6 rounded-xl">
              <h4 className="font-bold">Cần hỗ trợ?</h4>
              <button className="mt-4 bg-white text-green-700 px-4 py-2 rounded">
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <CreateRoundModal onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default RoundManagement;
