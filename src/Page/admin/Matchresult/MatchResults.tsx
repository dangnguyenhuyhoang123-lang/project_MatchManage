import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/Modal";
import { AppLayout } from "../../../layouts/AppLayout";
import { PageHeader } from "../../../components/PageHeader";
import MatchResultUpdate from "./MatchResultUpdate";
import MatchService from "../../../services/MatchService";
import LeagueService from "../../../services/LeagueService";
import { PhanTrang } from "../../../utils/PhanTrang";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../services/websocket/NotificationSocketService";

type LeagueOption = {
  id: number;
  name: string;
};

type SeasonOption = {
  id?: number;
  name?: string;
  year?: string;
};

const PAGE_SIZE = 10;
const CLIENT_FETCH_SIZE = 1000;

const getMatchTime = (match: any) => new Date(match?.matchDate || 0).getTime();

const sortMatchesByUpcomingPriority = (items: any[]) => {
  const now = Date.now();

  return [...items].sort((a, b) => {
    const timeA = getMatchTime(a);
    const timeB = getMatchTime(b);
    const isUpcomingA = timeA >= now;
    const isUpcomingB = timeB >= now;

    if (isUpcomingA !== isUpcomingB) {
      return isUpcomingA ? -1 : 1;
    }

    if (isUpcomingA && isUpcomingB) {
      return timeA - timeB;
    }

    return timeB - timeA;
  });
};

const uniqueMatchesById = (items: any[]) => {
  const map = new Map<number | string, any>();
  items.forEach((item, index) => {
    map.set(
      item?.id ??
        `${item?.homeTeam?.id}-${item?.awayTeam?.id}-${item?.matchDate}-${index}`,
      item,
    );
  });
  return Array.from(map.values());
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
  const [totalElements, setTotalElements] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState(
    "Không tìm thấy trận đấu nào.",
  );

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 100);
        setLeagues(response.content || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách giải đấu:", error);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchSeasons = async () => {
      if (!selectedLeague) {
        setSeasons([]);
        setSelectedSeason("");
        return;
      }

      try {
        const list = await LeagueService.getSeasonsByLeague(
          Number(selectedLeague),
        );
        setSeasons(list);
        setSelectedSeason("");
      } catch (error) {
        console.error("Lỗi khi tải danh sách mùa giải:", error);
        setSeasons([]);
        setSelectedSeason("");
      }
    };

    fetchSeasons();
  }, [selectedLeague]);

  const loadMatches = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        if (selectedLeague && !selectedSeason && seasons.length === 0) {
          setMatches([]);
          setTotalPages(1);
          setTotalElements(0);
          setCurrentPage(1);
          setEmptyMessage(
            "Giải đấu này chưa có mùa giải hoặc chưa có trận đấu nào.",
          );
          return;
        }

        if (selectedLeague && !selectedSeason) {
          const responses = await Promise.all(
            seasons
              .filter((season) => season.id)
              .map((season) =>
                MatchService.getAllMatches(0, CLIENT_FETCH_SIZE, {
                  seasonId: season.id,
                  search: searchQuery || undefined,
                }),
              ),
          );

          const allMatches = sortMatchesByUpcomingPriority(
            uniqueMatchesById(
              responses.flatMap((response) => response.data?.content || []),
            ),
          );
          const start = (page - 1) * PAGE_SIZE;
          const pagedMatches = allMatches.slice(start, start + PAGE_SIZE);

          setMatches(pagedMatches);
          setTotalElements(allMatches.length);
          setTotalPages(Math.max(1, Math.ceil(allMatches.length / PAGE_SIZE)));
          setCurrentPage(page);
          setEmptyMessage("Không có trận đấu nào thuộc giải đấu đã chọn.");
          return;
        }

        const response = await MatchService.getAllMatches(page - 1, PAGE_SIZE, {
          seasonId: selectedSeason ? Number(selectedSeason) : undefined,
          search: searchQuery || undefined,
        });

        const data = response.data;
        const content = sortMatchesByUpcomingPriority(data?.content || []);
        setMatches(content);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements ?? content.length);
        setCurrentPage(page);
        setEmptyMessage(
          selectedSeason
            ? "Mùa giải này chưa có trận đấu nào."
            : "Không tìm thấy trận đấu nào.",
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách trận đấu:", error);
        setMatches([]);
        setTotalPages(1);
        setTotalElements(0);
        setEmptyMessage("Không thể tải danh sách trận đấu.");
      } finally {
        setLoading(false);
      }
    },
    [selectedLeague, selectedSeason, seasons, searchQuery],
  );

  useEffect(() => {
    loadMatches(1);
  }, [loadMatches]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_MATCHES" ||
        event.action === "REFETCH_MATCH_DETAIL" ||
        event.action === "REFETCH_MATCH_STATS" ||
        event.referenceType === "MATCH" ||
        event.referenceType === "MATCH_STATS"
      ) {
        loadMatches(currentPage);
      }
    },
    [currentPage, loadMatches],
  );

  useRealtimeEvent(handleRealtimeEvent);

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

      <main className="flex-1 overflow-y-auto bg-surface p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[28px] border border-[#E4E2DE] bg-[#F5F3EF] px-5 py-4 shadow-[0_4px_12px_rgba(27,28,26,0.03)]">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#707A6C]">
                  search
                </span>
                <input
                  className="h-[56px] w-full rounded-[18px] border-none bg-[#ECE9E4] pl-12 pr-4 text-[16px] text-[#1B1C1A] outline-none placeholder:text-[#8B8B8B] focus:ring-2 focus:ring-[#D8D4CE]"
                  placeholder="Tìm kiếm trận đấu..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              <div className="relative">
                <select
                  className="h-[56px] w-full appearance-none rounded-[18px] border-none bg-[#ECE9E4] px-5 pr-10 text-[16px] text-[#1B1C1A] outline-none focus:ring-2 focus:ring-[#D8D4CE]"
                  value={selectedLeague}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedLeague(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setSelectedSeason("");
                  }}
                >
                  <option value="">Tất cả giải đấu</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#707A6C]">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  className="h-[56px] w-full appearance-none rounded-[18px] border-none bg-[#ECE9E4] px-5 pr-10 text-[16px] text-[#1B1C1A] outline-none focus:ring-2 focus:ring-[#D8D4CE] disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedSeason}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedSeason(
                      e.target.value ? Number(e.target.value) : "",
                    );
                  }}
                  disabled={!selectedLeague || seasons.length === 0}
                >
                  <option value="">Tất cả mùa giải</option>
                  {seasons.map((season) => (
                    <option
                      key={season.id ?? season.name ?? season.year}
                      value={season.id ?? ""}
                    >
                      {season.name || season.year}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#707A6C]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E4E2DE] bg-white p-4 shadow-[0_4px_12px_rgba(27,28,26,0.03)]">
            <div className="overflow-x-auto">
              <div className="min-w-[1100px] space-y-2">
                <div className="grid grid-cols-[360px_180px_180px_130px_180px_90px] gap-4 px-6 py-4 text-[13px] font-[800] uppercase tracking-[0.08em] text-[#5C67D6]">
                  <div>Trận đấu</div>
                  <div className="text-center">Tỷ số / Trạng thái</div>
                  <div>Giải đấu</div>
                  <div>Vòng đấu</div>
                  <div>Ngày thi đấu</div>
                  <div className="text-right">Thao tác</div>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center font-bold text-gray-500">
                    Đang tải dữ liệu trận đấu...
                  </div>
                ) : matches.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center font-bold text-gray-500">
                    {emptyMessage}
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
                        className="grid cursor-pointer grid-cols-[360px_180px_180px_130px_180px_90px] items-center gap-4 rounded-2xl bg-surface-container-lowest px-6 py-4 shadow-[0_4px_12px_rgba(27,28,26,0.03)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                            <span className="truncate text-right font-headline text-body-md font-semibold text-on-surface">
                              {homeName}
                            </span>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-surface-container">
                              {match.homeTeam?.logo ? (
                                <img
                                  src={match.homeTeam.logo}
                                  alt={homeName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[16px] text-green-700">
                                  shield
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-label-sm font-medium text-on-surface-variant">
                            vs
                          </span>
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-surface-container">
                              {match.awayTeam?.logo ? (
                                <img
                                  src={match.awayTeam.logo}
                                  alt={awayName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[16px] text-indigo-700">
                                  shield
                                </span>
                              )}
                            </div>
                            <span className="truncate font-headline text-body-md font-semibold text-on-surface">
                              {awayName}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          {isFinished ? (
                            <div className="flex items-center gap-2 rounded-full bg-[#E0E0FF] px-4 py-1 font-display text-lg font-bold text-[#27308A]">
                              <span>{match.homeScore ?? 0}</span>
                              <span className="text-sm font-normal">-</span>
                              <span>{match.awayScore ?? 0}</span>
                            </div>
                          ) : (
                            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                              {match.status === "SCHEDULED"
                                ? "CHƯA ĐÁ"
                                : match.status}
                            </span>
                          )}
                        </div>

                        <div className="truncate text-body-sm font-medium text-on-surface">
                          {match.league?.name || "-"}
                        </div>
                        <div>
                          <span className="inline-block rounded-sm bg-[#ABF4AC80] px-2 py-1 text-[10px] font-bold uppercase text-[#07521D]">
                            {match.round?.name || "-"}
                          </span>
                        </div>
                        <div className="text-body-sm font-medium text-on-surface-variant">
                          {formatDate(match.matchDate)}
                        </div>
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditMatch(match)}
                            className="flex items-center justify-center rounded-full p-2 text-[#0D631B] transition-colors hover:bg-[#ABF4AC80]"
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
            </div>
          </div>

          {totalElements > 0 && (
            <PhanTrang
              tongSoTrang={totalPages}
              trangHienTai={currentPage}
              xuLyTrang={(page) => loadMatches(page)}
            />
          )}
        </div>
      </main>

      <div className="mt-auto flex items-center justify-between px-8 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
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
