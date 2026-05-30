import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  Trophy,
  MoreHorizontal,
  Calendar,
  MapPin,
  Shield,
  Zap,
  Award,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Footer } from "../components/Footer/Footer_HomePage";
import MatchService from "../services/MatchService";
import LeagueService from "../services/LeagueService";
import { MatchModel } from "../model/Match/MatchModel";
import { League } from "../model/LeagueModel";
import { PhanTrang } from "../utils/PhanTrang";

export const PublicLeaguesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "finished">(
    "live",
  );
  const [featuredLeagues, setFeaturedLeagues] = useState<
    { league: League; seasons: any[] }[]
  >([]);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 2);
        const leagues = response.content || [];
        const enriched = await Promise.all(
          leagues.map(async (lg: League) => {
            const seasons = await LeagueService.getSeasonsByLeague(lg.id!);
            return { league: lg, seasons };
          }),
        );
        setFeaturedLeagues(enriched);
      } catch (err) {
        console.error("Error fetching featured leagues:", err);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
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
    };
    fetchMatches();
  }, [activeTab, page, debouncedSearch]);

  const groupedMatches = useMemo(() => {
    const groups: { [key: string]: MatchModel[] } = {};
    matches.forEach((m) => {
      const dateStr = m.matchDate.toLocaleDateString("vi-VN");
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(m);
    });
    return groups;
  }, [matches]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {featuredLeagues[0] && (
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gray-900 h-[320px]">
                <img
                  src={
                    featuredLeagues[0].league.logo ||
                    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800"
                  }
                  className="w-full h-full object-cover opacity-60"
                  alt={featuredLeagues[0].league.name}
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-[#1a6e38] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {featuredLeagues[0].league.scale || "Quốc gia"}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-1">
                    {featuredLeagues[0].league.name}
                  </h2>
                  <p className="text-gray-300 font-semibold mb-6">
                    {featuredLeagues[0].league.country}
                  </p>
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                        Mùa giải hiện tại
                      </p>
                      <p className="font-bold text-lg">
                        {featuredLeagues[0].seasons[0]?.name || "Đang cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                        Số đội
                      </p>
                      <p className="font-bold text-lg">
                        {featuredLeagues[0].seasons.length > 0
                          ? "14 Đội"
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {featuredLeagues[1] && (
              <div className="bg-[#f8f9fa] rounded-3xl p-6 border border-gray-100 flex flex-col justify-between h-[320px]">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#6ef08e] rounded-full flex items-center justify-center overflow-hidden">
                    {featuredLeagues[1].league.logo ? (
                      <img
                        src={featuredLeagues[1].league.logo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Trophy className="text-[#1a6e38]" size={20} />
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={24} />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {featuredLeagues[1].league.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {featuredLeagues[1].league.scale || "Giải đấu"}
                  </p>
                  <div className="flex justify-between border-t border-gray-200 pt-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">
                        Mùa giải
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {featuredLeagues[1].seasons[0]?.year || "Đang cập nhật"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">
                        Quốc gia
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {featuredLeagues[1].league.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  Đang tải dữ liệu trận đấu...
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
        {match.league?.name || "Giải đấu"}{" "}
        {match.season?.name ? `• ${match.season.name}` : ""}
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
            <MapPin size={12} /> Sân nhà{" "}
            {match.homeTeam?.name || "Đang cập nhật"}
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
