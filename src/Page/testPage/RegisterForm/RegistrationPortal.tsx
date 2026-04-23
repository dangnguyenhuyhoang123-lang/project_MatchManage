import React, { useEffect, useMemo, useState } from "react";
import { PhanTrang } from "../../../utils/PhanTrang";

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
  {
    id: "7",
    name: "B.Bình Dương",
    stadium: "Sân vận động Gò Đậu",
    squadCount: 29,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=BBD",
  },
  {
    id: "8",
    name: "B.Bình Dương",
    stadium: "Sân vận động Gò Đậu",
    squadCount: 29,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=BBD",
  },
  {
    id: "9",
    name: "B.Bình Dương",
    stadium: "Sân vận động Gò Đậu",
    squadCount: 29,
    status: "Hạng Nhất",
    logo: "https://placehold.co/100x100?text=BBD",
  },
  {
    id: "10",
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
        className={`material-symbols-outlined text-3xl transition-opacity ${
          isSelected
            ? "text-green-600 opacity-100"
            : "text-gray-200 opacity-0 group-hover:opacity-100"
        }`}
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

// --- Main Component ---
const RegistrationPortal: React.FC<{ setStep: (step: number) => void }> = ({
  setStep,
}) => {
  const [selectedClubId, setSelectedClubId] = useState<string | null>("2");
  const [search, setSearch] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const selectedClub = CLUBS.find((c) => c.id === selectedClubId);

  const filteredClubs = useMemo(() => {
    return CLUBS.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [search]);

  const tongSoTrang = Math.max(1, Math.ceil(filteredClubs.length / 6));

  const dsCLBTheoTrang = useMemo(() => {
    const startIndex = (trangHienTai - 1) * 6;
    return filteredClubs.slice(startIndex, startIndex + 6);
  }, [filteredClubs, trangHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [search]);

  useEffect(() => {
    if (trangHienTai > tongSoTrang) {
      setTrangHienTai(tongSoTrang);
    }
  }, [trangHienTai, tongSoTrang]);

  const handlePageChange = (page: number) => {
    setTrangHienTai(page);
  };

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm câu lạc bộ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#0d631b]/20 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dsCLBTheoTrang.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            isSelected={selectedClubId === club.id}
            onSelect={() => setSelectedClubId(club.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredClubs.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          Không tìm thấy câu lạc bộ
        </div>
      )}

      {/* Pagination */}
      {filteredClubs.length > 0 && (
        <PhanTrang
          tongSoTrang={tongSoTrang}
          trangHienTai={trangHienTai}
          xuLyTrang={handlePageChange}
        />
      )}

      {/* Footer */}
      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none">
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
              onClick={() => setStep(2)}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationPortal;
