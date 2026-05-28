import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../components/Modal";
import { AppLayout } from "../../../../layouts/AppLayout";
import { PageHeader } from "../../../../components/PageHeader";
import MatchResultUpdate from "./MatchResultUpdate";
import MatchService from "../../../../services/MatchService";
import LeagueService from "../../../../services/LeagueService";
import { PhanTrang } from "../../../../utils/PhanTrang";

type LeagueOption = {
  id: number;
  name: string;
};

type SeasonOption = {
  id: number;
  name: string;
  year?: string;
};

const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | "">("");
  const [selectedSeason, setSelectedSeason] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Fetch leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 100);
        const list = response.content || [];
        setLeagues(list);
        if (list.length > 0) {
          setSelectedLeague(list[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách giải đấu:", error);
      }
    };
    fetchLeagues();
  }, []);

  // 2. Fetch seasons when league changes
  useEffect(() => {
    if (selectedLeague) {
      const fetchSeasons = async () => {
        try {
          const list = await LeagueService.getSeasonsByLeague(
            Number(selectedLeague),
          );
          setSeasons(list);
          if (list.length > 0) {
            setSelectedSeason(list[0].id || "");
          } else {
            setSelectedSeason("");
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách mùa giải:", error);
        }
      };
      fetchSeasons();
    } else {
      setSeasons([]);
      setSelectedSeason("");
    }
  }, [selectedLeague]);

  // 3. Fetch matches
  const loadMatches = async (page = 1) => {
    setLoading(true);
    try {
      const res = await MatchService.getAllMatches(page - 1, 10, {
        seasonId: selectedSeason ? Number(selectedSeason) : undefined,
        search: searchQuery || undefined,
      });
      setMatches(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi khi tải danh sách trận đấu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches(1);
  }, [selectedSeason, searchQuery]);

  const handleEditMatch = (match: any) => {
    setSelectedMatch(match);
    setOpen(true);
  };

  const handleUpdateSuccess = () => {
    setOpen(false);
    setSelectedMatch(null);
    loadMatches(currentPage);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedMatch(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--/--/----";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Kết Quả Trận Đấu"
        description="Theo dõi và quản lý các kết quả thi đấu trong hệ thống quốc gia."
        buttonText="Tải lại dữ liệu"
        onButtonClick={() => loadMatches(currentPage)}
      />

      <main className="flex-1 overflow-y-auto p-8 bg-surface">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-[#F5F3EF] border border-[#E4E2DE] rounded-[28px] px-5 py-4 shadow-[0_4px_12px_rgba(27,28,26,0.03)]">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[22px]">
                search
              </span>
              <input
                className="w-full h-[56px] bg-[#ECE9E4] rounded-[18px] border-none outline-none pl-12 pr-4 text-[16px] text-[#1B1C1A] placeholder:text-[#8B8B8B] focus:ring-2 focus:ring-[#D8D4CE]"
                placeholder="Tìm kiếm trận đấu..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Right Filters */}
            <div className="flex gap-4 w-full md:w-auto">
              {/* League */}
              <div className="relative">
                <select
                  className="appearance-none h-[56px] min-w-[220px] bg-[#ECE9E4] rounded-[18px] px-5 pr-10 text-[16px] text-[#1B1C1A] border-none outline-none focus:ring-2 focus:ring-[#D8D4CE] cursor-pointer"
                  value={selectedLeague}
                  onChange={(e) => {
                    setSelectedLeague(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setSelectedSeason("");
                  }}
                >
                  <option value="">Tất cả Giải đấu</option>
                  {leagues.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Season */}
              <div className="relative">
                <select
                  className="appearance-none h-[56px] min-w-[190px] bg-[#ECE9E4] rounded-[18px] px-5 pr-10 text-[16px] text-[#1B1C1A] border-none outline-none focus:ring-2 focus:ring-[#D8D4CE] cursor-pointer disabled:opacity-50"
                  value={selectedSeason}
                  onChange={(e) =>
                    setSelectedSeason(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  disabled={!selectedLeague}
                >
                  <option value="">Tất cả Mùa giải</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.year}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 hidden md:grid text-[#5C67D6] text-[14px] font-[800] uppercase tracking-[0.08em] font-headline">
              <div className="col-span-4">TRẬN ĐẤU</div>
              <div className="col-span-2 text-center">TỶ SỐ / TRẠNG THÁI</div>
              <div className="col-span-2">GIẢI ĐẤU</div>
              <div className="col-span-1">VÒNG ĐẤU</div>
              <div className="col-span-2">NGÀY THI ĐẤU</div>
              <div className="col-span-1 text-right">THAO TÁC</div>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="text-center py-10 font-bold text-gray-500">
                Đang tải dữ liệu trận đấu...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-10 font-bold text-gray-500">
                Không tìm thấy trận đấu nào.
              </div>
            ) : (
              matches.map((match) => {
                const homeName = match.homeTeam?.name || "Chủ nhà";
                const awayName = match.awayTeam?.name || "Đội khách";
                const isFinished =
                  match.status === "FINISHED" ||
                  (match.homeScore != null && match.awayScore != null);

                return (
                  <div
                    key={match.id}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 bg-surface-container-lowest rounded-DEFAULT shadow-[0_4px_12px_rgba(27,28,26,0.03)] hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)] transition-shadow duration-300"
                  >
                    {/* Teams */}
                    <div className="col-span-4 flex items-center justify-between md:justify-start gap-4">
                      <div className="flex items-center gap-3 w-[45%] justify-end">
                        <span className="font-headline font-semibold text-body-md text-on-surface text-right truncate">
                          {homeName}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                          {match.homeTeam?.logo ? (
                            <img
                              src={match.homeTeam.logo}
                              alt={homeName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-green-700">
                              shield
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-label-sm text-on-surface-variant font-medium shrink-0">
                        vs
                      </span>
                      <div className="flex items-center gap-3 w-[45%]">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                          {match.awayTeam?.logo ? (
                            <img
                              src={match.awayTeam.logo}
                              alt={awayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-indigo-700">
                              shield
                            </span>
                          )}
                        </div>
                        <span className="font-headline font-semibold text-body-md text-on-surface truncate">
                          {awayName}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 flex justify-center items-center">
                      {isFinished ? (
                        <div className="px-4 py-1 bg-[#E0E0FF] rounded-full flex gap-2 items-center font-display font-bold text-lg text-[#27308A]">
                          <span>{match.homeScore ?? 0}</span>
                          <span className="text-sm font-normal">-</span>
                          <span>{match.awayScore ?? 0}</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                          {match.status === "SCHEDULED"
                            ? "CHƯA ĐÁ"
                            : match.status}
                        </span>
                      )}
                    </div>

                    {/* League */}
                    <div className="col-span-2 flex flex-col md:block">
                      <span className="text-body-sm text-on-surface font-medium">
                        {match.league?.name || "Giải đấu nội bộ"}
                      </span>
                    </div>

                    {/* Round */}
                    <div className="col-span-1 flex flex-col md:block">
                      <span className="inline-block px-2 py-1 text-[10px] font-bold rounded-sm bg-[#ABF4AC80] text-[#07521D] uppercase">
                        {match.round?.name || "-"}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 flex flex-col md:block text-body-sm text-on-surface-variant font-medium">
                      {formatDate(match.matchDate)}
                    </div>

                    {/* Actions */}
                    <div
                      className="col-span-1 flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="p-2 text-[#0D631B] hover:bg-[#ABF4AC80] rounded-full transition-colors flex items-center justify-center"
                        title="Cập nhật kết quả"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit_square
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {matches.length > 0 && (
            <PhanTrang
              tongSoTrang={totalPages}
              trangHienTai={currentPage}
              xuLyTrang={(page) => loadMatches(page)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto py-8 px-8 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
        <span>© 2024 VFF - Elite Pitch Manager</span>
        <span>Phiên bản 1.2.0-Tactical</span>
      </div>

      <Modal open={open} onClose={handleCloseModal} size="xl">
        {selectedMatch && (
          <MatchResultUpdate
            matchData={selectedMatch}
            onClose={handleCloseModal}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </Modal>
    </AppLayout>
  );
};

export default MatchResults;
