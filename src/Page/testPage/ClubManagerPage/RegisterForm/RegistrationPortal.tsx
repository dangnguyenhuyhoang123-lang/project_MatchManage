import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import { PhanTrang } from "../../../../utils/PhanTrang";
import SeasonService from "../../../../services/SeasonService";
import type { SelectedSeason } from "./RegisterFormMatch";

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
    className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border-2 bg-white p-6 transition-all hover:-translate-y-1 ${
      isSelected
        ? "border-green-600 ring-4 ring-green-600/5 shadow-xl"
        : "border-transparent shadow-sm hover:shadow-lg"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-3 text-green-700">
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
      <h3 className="mb-1 text-xl font-bold text-gray-900">
        {season.name || season.year}
      </h3>

      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
        <span className="material-symbols-outlined text-base">
          calendar_month
        </span>
        <span>
          {season.startDate} đến {season.endDate}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
          {season.leagueName || "Giải đấu"}
        </span>
      </div>
    </div>
  </div>
);

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
      (season.name || season.year || "")
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
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
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#0d631b]/20"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner
          message="Đang tải danh sách mùa giải"
          description="Mùa giải đang được đồng bộ để bạn chọn hồ sơ đăng ký phù hợp."
          fullHeight
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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

          {filteredSeasons.length === 0 && (
            <div className="py-10 text-center font-bold text-gray-400">
              Không tìm thấy mùa giải nào
            </div>
          )}

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

      <div className="pointer-events-none fixed bottom-10 left-64 right-0 z-50 flex justify-center px-10">
        <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-gray-100 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Đã chọn để đăng ký
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="rounded-full px-8 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50">
              Hủy bỏ
            </button>

            <button
              className="rounded-full bg-green-700 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-green-700/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
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
