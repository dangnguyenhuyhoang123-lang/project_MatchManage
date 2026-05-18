import React, { useEffect, useMemo, useState } from "react";
import { PhanTrang } from "../../../utils/PhanTrang";
import SeasonService from "../../../services/SeasonService";
import type { SelectedSeason } from "./RegisterFormMatch";

// --- Sub-components ---
const SeasonCard = ({
  season,
  isSelected,
  onSelect,
}: {
  season: any;
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
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-3 text-green-700">
        <span className="material-symbols-outlined text-3xl">emoji_events</span>
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
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {season.name || season.year}
      </h3>

      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
        <span className="material-symbols-outlined text-base">calendar_month</span>
        <span>
          {season.startDate} đến {season.endDate}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
          {season.leagueName || "Giải đấu"}
        </span>
      </div>
    </div>
  </div>
);

// --- Main Component ---
type Props = {
  setStep: (step: number) => void;
  selectedSeason: SelectedSeason | null;
  onSeasonSelected: (season: SelectedSeason) => void;
};

const RegistrationPortal: React.FC<Props> = ({
  setStep,
  selectedSeason,
  onSeasonSelected,
}) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    selectedSeason?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await SeasonService.getAllSeasons(0, 100);
        setSeasons(response.data?.content || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách mùa giải:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  const filteredSeasons = useMemo(() => {
    return seasons.filter((season) =>
      (season.name || season.year || "").toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [search, seasons]);

  const tongSoTrang = Math.max(1, Math.ceil(filteredSeasons.length / 6));

  const dsSeasonTheoTrang = useMemo(() => {
    const startIndex = (trangHienTai - 1) * 6;
    return filteredSeasons.slice(startIndex, startIndex + 6);
  }, [filteredSeasons, trangHienTai]);

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

  const selectedSeasonData =
    seasons.find((s) => s.id === selectedSeasonId) ?? selectedSeason;

  return (
    <div className="pb-24">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm mùa giải..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#0d631b]/20 outline-none shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-bold">
          Đang tải danh sách mùa giải...
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {dsSeasonTheoTrang.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                isSelected={selectedSeasonId === season.id}
                onSelect={() => {
                  setSelectedSeasonId(season.id);
                  onSeasonSelected({
                    id: Number(season.id),
                    name: season.name,
                    year: season.year,
                    leagueName: season.leagueName,
                    startDate: season.startDate,
                    endDate: season.endDate,
                  });
                }}
              />
            ))}
          </div>

          {/* Empty state */}
          {filteredSeasons.length === 0 && (
            <div className="text-center text-gray-400 py-10 font-bold">
              Không tìm thấy mùa giải nào
            </div>
          )}

          {/* Pagination */}
          {filteredSeasons.length > 0 && (
            <div className="mt-8 flex justify-center">
              <PhanTrang
                tongSoTrang={tongSoTrang}
                trangHienTai={trangHienTai}
                xuLyTrang={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                emoji_events
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {selectedSeasonData?.name ||
                  selectedSeasonData?.year ||
                  "Chưa chọn Mùa giải"}
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
              disabled={!selectedSeasonId}
              onClick={() => {
                setStep(2);
              }}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPortal;
