import { AppLayout } from "../../layouts/AppLayout";
import StandingService from "../../services/StandingService";
import LeagueService from "../../services/LeagueService";
import { useCallback, useEffect, useState } from "react";
import { useRealtimeEvent } from "../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../services/websocket/NotificationSocketService";

type LeagueOption = {
  id: number;
  name: string;
};

type SeasonOption = {
  id?: number;
  name?: string;
  year?: string;
};

interface TeamStanding {
  rank: number;
  name: string;
  stadium: string;
  played: number;
  stats: string;
  hs: string;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  last5: ("W" | "D" | "L" | "-")[];
  rankColor: string;
}

export default function StandingsPage() {
  const [standingsData, setStandingsData] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState(
    "Vui lòng chọn mùa giải để xem bảng xếp hạng.",
  );

  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);

  const [selectedLeague, setSelectedLeague] = useState<number | "">("");
  const [selectedSeason, setSelectedSeason] = useState<number | "">("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 100);
        setLeagues(response.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách giải đấu:", error);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchSeasons = async () => {
      if (!selectedLeague) {
        setSeasons([]);
        setSelectedSeason("");
        setStandingsData([]);
        setEmptyMessage(
          "Vui lòng chọn giải đấu và mùa giải để xem bảng xếp hạng.",
        );
        return;
      }

      try {
        const response = await LeagueService.getSeasonsByLeague(
          Number(selectedLeague),
        );
        setSeasons(response);
        setSelectedSeason("");
        setStandingsData([]);
        setEmptyMessage(
          response.length > 0
            ? "Vui lòng chọn mùa giải để xem bảng xếp hạng."
            : "Giải đấu này chưa có mùa giải nào.",
        );
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mùa giải:", error);
        setSeasons([]);
        setSelectedSeason("");
        setStandingsData([]);
        setEmptyMessage("Không thể tải danh sách mùa giải của giải đấu này.");
      }
    };

    fetchSeasons();
  }, [selectedLeague]);

  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedSeason) {
        setStandingsData([]);
        setLoading(false);
        setEmptyMessage(
          selectedLeague
            ? "Vui lòng chọn mùa giải để xem bảng xếp hạng."
            : "Vui lòng chọn giải đấu và mùa giải để xem bảng xếp hạng.",
        );
        return;
      }

      setLoading(true);
      try {
        const response = await StandingService.getAllStandings(
          Number(selectedSeason),
        );
        const data = Array.isArray(response.data) ? response.data : [];
        const formattedData = data.map((item: any, index: number) => {
          const goalDifference = item.goalDifference ?? 0;
          const goalsFor =
            item.goalsFor ?? item.goalFor ?? item.totalGoalsFor ?? 0;
          const goalsAgainst =
            item.goalsAgainst ??
            item.goalAgainst ??
            item.totalGoalsAgainst ??
            0;

          return {
            rank: item.rank || item.rankPosition || index + 1,
            name: item.teamName || item.name || item.clubName || "Đội bóng",
            stadium:
              item.stadium || item.stadiumName || "Sân vận động: Chưa rõ",
            played: item.played || item.matchesPlayed || 0,
            stats: `${item.win ?? item.won ?? 0} - ${item.draw ?? item.drawn ?? 0} - ${item.lose ?? item.lost ?? 0}`,
            hs: goalDifference > 0 ? `+${goalDifference}` : `${goalDifference}`,
            goalsFor,
            goalsAgainst,
            points: item.points || 0,
            last5: item.last5 || ["-", "-", "-", "-", "-"],
            rankColor:
              index === 0
                ? "border-l-yellow-400"
                : index === 1
                  ? "border-l-gray-400"
                  : index === 2
                    ? "border-l-orange-400"
                    : "border-l-green-500",
          };
        });

        setStandingsData(formattedData);
        setEmptyMessage("Mùa giải này chưa có dữ liệu bảng xếp hạng.");
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bảng xếp hạng:", error);
        setStandingsData([]);
        setEmptyMessage("Không thể tải dữ liệu bảng xếp hạng.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [selectedLeague, selectedSeason, reloadKey]);

  const handleRealtimeEvent = useCallback((event: RealtimeEventDTO) => {
    if (
      event.action === "REFETCH_STANDINGS" ||
      event.referenceType === "STANDING"
    ) {
      setReloadKey((current) => current + 1);
    }
  }, []);

  useRealtimeEvent(handleRealtimeEvent);

  return (
    <AppLayout>
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            <span className="text-green-700">Bảng Xếp</span> Hạng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn đúng giải đấu và mùa giải để xem bảng xếp hạng chính xác.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[520px]">
          <select
            className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold shadow-sm outline-none hover:bg-gray-50"
            value={selectedLeague}
            onChange={(e) => {
              setSelectedLeague(e.target.value ? Number(e.target.value) : "");
              setSelectedSeason("");
            }}
          >
            <option value="">-- Chọn Giải đấu --</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold shadow-sm outline-none hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedSeason}
            onChange={(e) =>
              setSelectedSeason(e.target.value ? Number(e.target.value) : "")
            }
            disabled={!selectedLeague || seasons.length === 0}
          >
            <option value="">-- Chọn Mùa giải --</option>
            {seasons.map((season) => (
              <option
                key={season.id ?? season.name ?? season.year}
                value={season.id ?? ""}
              >
                {season.name || season.year}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="rounded-[2rem] border border-gray-200 bg-[#f0ede6]/40 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="mb-4 grid grid-cols-12 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-1 text-center">Hạng</div>
              <div className="col-span-4">Câu lạc bộ</div>
              <div className="col-span-1 text-center">Trận</div>
              <div className="col-span-2 text-center">T - H - B</div>
              <div className="col-span-1 text-center">HS</div>
              <div className="col-span-1 text-center">Điểm</div>
              <div className="col-span-2 text-center">5 trận gần nhất</div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-white py-12 text-center font-bold text-slate-500">
                  Đang tải dữ liệu bảng xếp hạng...
                </div>
              ) : standingsData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center font-bold text-slate-500">
                  {emptyMessage}
                </div>
              ) : (
                standingsData.map((team) => (
                  <div
                    key={`${team.rank}-${team.name}`}
                    className={`grid grid-cols-12 items-center rounded-2xl border-l-4 bg-white p-4 shadow-sm transition-transform hover:translate-x-1 ${team.rankColor}`}
                  >
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                          team.rank <= 3
                            ? "border border-amber-200 bg-amber-50 text-amber-700"
                            : "text-slate-400"
                        }`}
                      >
                        {team.rank}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-slate-100 text-[10px] font-bold text-slate-400">
                        LOGO
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {team.name}
                        </p>
                        <p className="truncate text-[10px] font-semibold uppercase opacity-50">
                          {team.stadium}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-1 text-center font-bold">
                      {team.played}
                    </div>
                    <div className="col-span-2 text-center text-sm font-medium text-slate-600">
                      {team.stats}
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-bold text-green-600">{team.hs}</p>
                      <p className="text-[9px] opacity-40">
                        ({team.goalsFor}/{team.goalsAgainst})
                      </p>
                    </div>
                    <div className="col-span-1 text-center text-lg font-black">
                      {team.points}
                    </div>

                    <div className="col-span-2 flex justify-center gap-1.5">
                      {team.last5.map((res, i) => (
                        <div
                          key={i}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm ${
                            res === "W"
                              ? "bg-green-600"
                              : res === "D"
                                ? "bg-indigo-500"
                                : res === "L"
                                  ? "bg-red-500"
                                  : "bg-slate-300"
                          }`}
                        >
                          {res}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 px-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4 text-[10px] font-bold opacity-60">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-600" /> THẮNG
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> HÒA
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> THUA
            </span>
          </div>
          <p className="max-w-xl text-[10px] font-medium leading-relaxed opacity-50 lg:text-right">
            <span className="font-bold text-slate-900">Quy tắc xếp hạng:</span>{" "}
            hệ thống sắp xếp theo bộ quy định gắn với mùa giải đang chọn.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
