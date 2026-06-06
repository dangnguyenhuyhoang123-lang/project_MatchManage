import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  Zap,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Footer } from "../../components/Footer/Footer_HomePage";
import MatchService from "../../services/MatchService";
import LeagueService from "../../services/LeagueService";
import SeasonService from "../../services/SeasonService";
import { MatchModel } from "../../model/Match/MatchModel";
import { League } from "../../model/LeagueModel";
import { PhanTrang } from "../../utils/PhanTrang";
import { usePublicRealtimeEvent } from "../../hooks/usePublicRealtimeEvent";
import type { RealtimeEventDTO } from "../../model/RealtimeEvent";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

export const PublicLeaguesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "finished">(
    "upcoming",
  );
  const [featuredLeagues, setFeaturedLeagues] = useState<
    { league: League; seasons: any[] }[]
  >([]);
  const [featuredLeagueIndex, setFeaturedLeagueIndex] = useState(0);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState("");

  const [, setSlideDirection] = useState<"left" | "right">("right");
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedSeasonId]);

  const fetchSeasons = useCallback(async () => {
    try {
      const response = await SeasonService.getAllSeasons(0, 200);
      const content = response.data?.content || response.data || [];
      setSeasons(Array.isArray(content) ? content : []);
    } catch (err) {
      console.warn("PublicLeaguesPage: cannot load seasons for filter", err);
      setSeasons([]);
    }
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const fetchFeatured = useCallback(async () => {
    try {
      const response = await LeagueService.getAllLeaguesNormalized(0, 12);
      const leagues = response.content || [];

      const enriched = await Promise.all(
        leagues.map(async (lg: League) => {
          const seasons = await LeagueService.getSeasonsByLeague(lg.id!);
          return { league: lg, seasons };
        }),
      );

      setFeaturedLeagues(enriched);
      setFeaturedLeagueIndex(0);
    } catch (err) {
      console.error("Error fetching featured leagues:", err);
    }
  }, []);
  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const apiStatus =
        activeTab === "live"
          ? "LIVE"
          : activeTab === "upcoming"
            ? "SCHEDULED"
            : "FINISHED";
      const response = await MatchService.getAllMatches(page - 1, 5, {
        status: apiStatus,
        search: debouncedSearch || undefined,
        seasonId: selectedSeasonId ? Number(selectedSeasonId) : undefined,
      });
      const data = response.data?.content || [];
      setMatches(
        data.map(
          (m: any) =>
            new MatchModel({
              ...m,
              matchDate: new Date(m.matchDate),
            }),
        ),
      );
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page, selectedSeasonId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handlePublicRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.action === "REFETCH_MATCHES" ||
        event.action === "REFETCH_MATCH_DETAIL" ||
        event.action === "REFETCH_MATCH_EVENTS" ||
        event.action === "REFETCH_MATCH_STATS" ||
        event.action === "REFETCH_LINEUPS"
      ) {
        void fetchMatches();
      }

      if (
        event.action === "REFETCH_LEAGUES" ||
        event.action === "REFETCH_SEASONS" ||
        event.action === "REFETCH_ROUNDS" ||
        event.action === "REFETCH_SEASON_TEAMS"
      ) {
        void fetchFeatured();
        void fetchSeasons();
      }
    },
    [fetchMatches, fetchFeatured, fetchSeasons],
  );

  usePublicRealtimeEvent(["matches", "leagues"], handlePublicRealtimeEvent);

  const groupedMatches = useMemo(() => {
    const groups: { [key: string]: MatchModel[] } = {};
    matches.forEach((m) => {
      const dateStr = m.matchDate.toLocaleDateString("vi-VN");
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(m);
    });
    return groups;
  }, [matches]);
  const activeFeaturedLeague = featuredLeagues[featuredLeagueIndex];
  const activeSeason = activeFeaturedLeague?.seasons?.[0];
  const seasonOptions = useMemo(
    () =>
      [...seasons]
        .filter((season) => season?.id != null)
        .sort((a, b) =>
          String(a.name || a.year || "").localeCompare(
            String(b.name || b.year || ""),
            "vi",
          ),
        ),
    [seasons],
  );

  const goToPreviousFeaturedLeague = () => {
    if (featuredLeagues.length === 0 || isSliding) return;

    setSlideDirection("left");
    setIsSliding(true);

    setTimeout(() => {
      setFeaturedLeagueIndex(
        (current) =>
          (current - 1 + featuredLeagues.length) % featuredLeagues.length,
      );
      setIsSliding(false);
    }, 180);
  };

  const goToNextFeaturedLeague = () => {
    if (featuredLeagues.length === 0 || isSliding) return;

    setSlideDirection("right");
    setIsSliding(true);

    setTimeout(() => {
      setFeaturedLeagueIndex(
        (current) => (current + 1) % featuredLeagues.length,
      );
      setIsSliding(false);
    }, 180);
  };

  return (
    <div>
      <div className="pt-12">
        <div className="max-w-360 mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Trung tâm trận đấu
              </h1>
              <p className="text-gray-500 text-lg">
                Cập nhật tỷ số trực tiếp, lịch thi đấu sắp tới và kết quả chi
                tiết của tất cả các giải đấu hàng đầu.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm giải đấu, đội bóng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-100 rounded-lg pl-10 pr-4 py-2.5 w-full font-semibold text-gray-700 text-sm outline-none focus:ring-2 focus:ring-[#1a6e38]/20 focus:bg-white transition-all border border-transparent focus:border-[#1a6e38]"
                />
              </div>
              <select
                value={selectedSeasonId}
                onChange={(event) => setSelectedSeasonId(event.target.value)}
                className="h-[42px] w-full rounded-lg border border-transparent bg-gray-100 px-4 text-sm font-semibold text-gray-700 outline-none transition-all focus:border-[#1a6e38] focus:bg-white focus:ring-2 focus:ring-[#1a6e38]/20 sm:w-56"
              >
                <option value="">Tất cả mùa giải</option>
                {seasonOptions.map((season) => (
                  <option key={season.id} value={String(season.id)}>
                    {season.name || season.year || `Mùa giải #${season.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFeaturedLeague && (
            <div className="relative mb-10">
              <div
                className="relative rounded-3xl overflow-hidden bg-gray-900 h-[360px] cursor-pointer group"
                onClick={() =>
                  activeFeaturedLeague.league.id &&
                  navigate(`/leagues/${activeFeaturedLeague.league.id}`)
                }
              >
                <img
                  src={
                    activeFeaturedLeague.league.logo ||
                    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=1200"
                  }
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  alt={activeFeaturedLeague.league.name}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />

                {featuredLeagues.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToPreviousFeaturedLeague();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20"
                      aria-label="Xem giải đấu trước"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToNextFeaturedLeague();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20"
                      aria-label="Xem giải đấu tiếp theo"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  <span className="bg-[#1a6e38] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {activeFeaturedLeague.league.scale || "Giải đấu"}
                  </span>
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {activeFeaturedLeague.league.country || "Đang cập nhật"}
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 mb-3">
                    Giải đấu nổi bật
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black mb-3 max-w-3xl">
                    {activeFeaturedLeague.league.name}
                  </h2>

                  <div className="flex flex-wrap gap-10 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase mb-1">
                        Mùa giải hiện tại
                      </p>
                      <p className="font-bold text-lg">
                        {activeSeason?.year ||
                          activeSeason?.name ||
                          "Đang cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase mb-1">
                        Số mùa giải
                      </p>
                      <p className="font-bold text-lg">
                        {activeFeaturedLeague.seasons.length || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>

                  {activeFeaturedLeague.seasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFeaturedLeague.seasons
                        .slice(0, 5)
                        .map((season) => (
                          <button
                            key={season.id ?? season.year ?? season.name}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (activeFeaturedLeague.league.id && season.id) {
                                navigate(
                                  `/leagues/${activeFeaturedLeague.league.id}/seasons/${season.id}`,
                                );
                              }
                            }}
                            className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 text-xs font-bold text-white transition-colors"
                          >
                            {season.year || season.name || "Mùa giải"}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {featuredLeagues.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {featuredLeagues.map((item, index) => (
                    <button
                      key={item.league.id ?? item.league.name ?? index}
                      type="button"
                      onClick={() => setFeaturedLeagueIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === featuredLeagueIndex
                          ? "w-8 bg-[#1a6e38]"
                          : "w-2.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Xem ${item.league.name}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-[#f4f5f4] rounded-3xl p-6 md:p-8 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex bg-white rounded-full p-1 shadow-sm w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("live")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 justify-center ${
                    activeTab === "live"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "live" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  Trực tiếp
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upcoming")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                    activeTab === "upcoming"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Sắp diễn ra
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("finished")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                    activeTab === "finished"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Đã diễn ra
                </button>
              </div>

              {/* The right side filters (optional, since we now have search at the top, we can keep it clean or use it for additional filters) */}
              <div className="flex gap-3 w-full md:w-auto">
                {/* Optional additional filters could go here */}
              </div>
            </div>

            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-12 text-gray-500 font-bold">
                  <LoadingSpinner />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-bold">
                  Không có trận đấu nào.
                </div>
              ) : (
                Object.entries(groupedMatches).map(([dateStr, dayMatches]) => (
                  <div key={dateStr}>
                    <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4">
                      {dateStr}
                    </h3>
                    <div className="space-y-4">
                      {dayMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          type={activeTab}
                          onClick={() => navigate(`/matches/${match.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="mb-16">
              <PhanTrang
                tongSoTrang={totalPages}
                trangHienTai={page}
                xuLyTrang={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

function MatchCard({
  match,
  type,
  onClick,
}: {
  match: MatchModel;
  type: "live" | "upcoming" | "finished";
  onClick?: () => void;
}) {
  const isLive = type === "live";
  const isUpcoming = type === "upcoming";
  const hasPrediction = hasPredictedScore(match);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 md:px-10 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#1a6e38]/30 transition-all group"
    >
      <div className="text-sm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left uppercase group-hover:text-[#1a6e38] transition-colors">
        {match.season?.name ? ` ${match.season.name}` : ""}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        {/* Home Team */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-1/3">
          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center overflow-hidden">
            {match.homeTeam?.logo ? (
              <img
                src={match.homeTeam.logo}
                className="w-full h-full object-cover"
                alt={match.homeTeam.name}
              />
            ) : (
              <Shield size={20} />
            )}
          </div>
          <span className="text-lg font-bold text-gray-900 text-center md:text-left">
            {match.homeTeam?.name || "Chủ nhà"}
          </span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
          {isLive ? (
            <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              LIVE{" "}
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full">
              {formatTime(match.matchDate)}
            </div>
          )}

          <div className="flex items-center gap-4 font-bold">
            {isUpcoming ? (
              <>
                <span>-</span>
                <span className="text-gray-900 text-xl font-black">VS</span>
                <span>-</span>
              </>
            ) : (
              <>
                <span
                  className={`text-4xl font-black ${isLive ? "text-green-700" : "text-gray-900"}`}
                >
                  {match.homeScore ?? 0}
                </span>
                <span className="text-gray-300 text-3xl font-light">-</span>
                <span
                  className={`text-4xl font-black ${isLive ? "text-gray-900" : "text-gray-900"}`}
                >
                  {match.awayScore ?? 0}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
            <MapPin size={12} />{" "}
            {match.homeTeam?.stadiumName || "Đang cập nhật"}
          </div>

          {hasPrediction && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">
              <Zap size={13} />
              Dự đoán {match.predictedHomeScore} - {match.predictedAwayScore}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 w-full md:w-1/3">
          <span className="text-lg font-bold text-gray-900 text-center md:text-right hidden md:block">
            {match.awayTeam?.name || "Đội khách"}
          </span>
          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center overflow-hidden">
            {match.awayTeam?.logo ? (
              <img
                src={match.awayTeam.logo}
                className="w-full h-full object-cover"
                alt={match.awayTeam.name}
              />
            ) : (
              <Shield size={20} />
            )}
          </div>
          <span className="text-lg font-bold text-gray-900 text-center md:text-right block md:hidden">
            {match.awayTeam?.name || "Đội khách"}
          </span>
        </div>
      </div>
    </div>
  );
}

function hasPredictedScore(match: MatchModel) {
  return match.predictedHomeScore != null && match.predictedAwayScore != null;
}

export default PublicLeaguesPage;
