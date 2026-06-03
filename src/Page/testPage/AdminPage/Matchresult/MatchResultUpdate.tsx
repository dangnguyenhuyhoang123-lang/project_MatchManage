import { useCallback, useState, useEffect, type FC } from "react";
import { toast } from "sonner";
import MatchService from "../../../../services/MatchService";
import PlayerSeasonService from "../../../../services/PlayerSeasonService";
import SystemRuleService, {
  type SystemRule,
} from "../../../../services/SystemRuleService";
import type { MatchEvent } from "../../../../model/Match/MatchEvents";
import type { MatchStats } from "../../../../model/Match/MatchStats";
import ConfirmModal from "../../../../components/ConfirmModal";
import MatchEventModal from "./MatchEventModal";
import MatchSupervisorReportModal from "../../../../components/match/MatchSupervisorReportModal";

import type {
  MatchLineup,
  MatchLineupsResponse,
} from "../../../../model/Match/MatchLineup";
import type { MatchEventUpsertRequest } from "../../../../model/Match/MatchEvents";
import type { PlayerSeason } from "../../../../model/PlayerSeason";
import { useRealtimeEvent } from "../../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../../services/websocket/NotificationSocketService";

interface MatchResultUpdateProps {
  matchData: any;
  onClose?: () => void;
  onUpdateSuccess?: () => void;
}

type MatchPlayerOption = {
  playerId: number;
  playerName: string;
  teamName?: string | null;
  shirtNumber?: number | null;
};

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  if (Array.isArray(page?.content)) return page.content;
  if (Array.isArray(page?.data)) return page.data;
  if (page?.data && !Array.isArray(page.data)) {
    return Array.isArray(page.data.content) ? page.data.content : [];
  }
  return [];
}

function lineupToOption(player: MatchLineup, teamName?: string | null) {
  return {
    playerId: player.playerId,
    playerName: player.playerName,
    teamName,
    shirtNumber: player.shirtNumber,
  };
}

function getLineupPlayerOptions(
  lineupsData: MatchLineupsResponse | null,
): MatchPlayerOption[] {
  if (!lineupsData) return [];

  return [
    ...(lineupsData.home?.lineups ?? []).map((player) =>
      lineupToOption(player, lineupsData.home?.teamName),
    ),
    ...(lineupsData.away?.lineups ?? []).map((player) =>
      lineupToOption(player, lineupsData.away?.teamName),
    ),
  ];
}

const MatchResultUpdate: FC<MatchResultUpdateProps> = ({
  matchData,
  onClose,
  onUpdateSuccess,
}) => {
  // const [homeScore, setHomeScore] = useState<number>(matchData?.homeScore ?? 0);
  // const [awayScore, setAwayScore] = useState<number>(matchData?.awayScore ?? 0);
  // const [loading, setLoading] = useState(false);

  // const [events, setEvents] = useState<MatchEvent[]>([]);
  // const [stats, setStats] = useState<MatchStats[]>([]);
  // const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentMatch, setCurrentMatch] = useState(matchData);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [stats, setStats] = useState<MatchStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSupervisorReportOpen, setIsSupervisorReportOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [lineups, setLineups] = useState<MatchLineupsResponse | null>(null);
  const [systemRule, setSystemRule] = useState<SystemRule | null>(null);
  const [motmCandidates, setMotmCandidates] = useState<MatchPlayerOption[]>([]);
  const [selectedMotmPlayerId, setSelectedMotmPlayerId] = useState<number | "">(
    matchData?.manOfTheMatchPlayerId ?? "",
  );
  // const [eventForm, setEventForm] = useState({
  //   eventType: "GOAL" as "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION",
  //   goalType: "NORMAL" as "NORMAL" | "PENALTY" | "OWN_GOAL",
  //   teamId: 0,
  //   playerId: 0,
  //   playerInId: 0,
  //   assistPlayerId: 0,
  //   minute: 1,
  //   extraMinute: null as number | null,
  //   note: "",
  // });
  const homeTeamId = matchData?.homeTeam?.id;
  const awayTeamId = matchData?.awayTeam?.id;

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!matchData?.id) return;
  //     try {
  //       setIsLoadingData(true);
  //       const [eventsData, statsData] = await Promise.all([
  //         MatchService.getListEventMatch(matchData.id),
  //         MatchService.getStatsMatch(matchData.id),
  //       ]);
  //       setEvents(eventsData || []);
  //       setStats(statsData || []);
  //     } catch (error) {
  //       console.error("Lỗi khi tải dữ liệu trận đấu:", error);
  //     } finally {
  //       setIsLoadingData(false);
  //     }
  //   };

  //   fetchData();
  // }, [matchData?.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!matchData?.id) return;

      try {
        setIsLoadingData(true);
        await reloadMatchData();
        await loadSystemRule();
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trận đấu:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [matchData?.id]);

  const loadFallbackMotmCandidates = async (
    match: typeof currentMatch,
  ): Promise<MatchPlayerOption[]> => {
    const teamIds = [match?.homeTeam?.id, match?.awayTeam?.id].filter(
      (teamId): teamId is number => Number.isFinite(Number(teamId)),
    );
    const candidates: MatchPlayerOption[] = [];

    for (const teamId of teamIds) {
      try {
        const teamSeasonRes = await MatchService.getTeamSeasonByMatchAndTeam(
          matchData.id,
          teamId,
        );
        const teamSeasonId = teamSeasonRes.data?.teamSeasonId;
        if (!teamSeasonId) continue;

        const playerSeasonRes =
          await PlayerSeasonService.getPlayerSeasonsByTeamSeason(teamSeasonId);
        readArray<PlayerSeason>(playerSeasonRes.data).forEach((player) => {
          candidates.push({
            playerId: Number(player.playerId),
            playerName: player.playerName || `Cầu thủ #${player.playerId}`,
            teamName: player.teamName,
            shirtNumber: player.shirtNumber,
          });
        });
      } catch (error) {
        console.error("Cannot load fallback MOTM players", error);
      }
    }

    return candidates;
  };

  const reloadMatchData = async () => {
    if (!matchData?.id) return;

    const [updatedMatch, eventsData, statsData, lineupsData] =
      await Promise.all([
        MatchService.getMatchById(matchData.id),
        MatchService.getListEventMatch(matchData.id),
        MatchService.getStatsMatch(matchData.id),
        MatchService.getMatchLineups(matchData.id),
      ]);

    const lineupCandidates = getLineupPlayerOptions(lineupsData);
    const candidates =
      lineupCandidates.length > 0
        ? lineupCandidates
        : await loadFallbackMotmCandidates(updatedMatch);

    setCurrentMatch(updatedMatch);
    setSelectedMotmPlayerId(updatedMatch.manOfTheMatchPlayerId ?? "");
    setEvents(eventsData || []);
    setStats(statsData || []);
    setLineups(lineupsData);
    setMotmCandidates(candidates);
  };

  const loadSystemRule = async () => {
    const systemRuleId = Number(matchData?.season?.systemRuleId);
    if (!Number.isFinite(systemRuleId) || systemRuleId <= 0) {
      setSystemRule(null);
      return;
    }

    try {
      const response = await SystemRuleService.getById(systemRuleId);
      setSystemRule(response.data);
    } catch (error) {
      console.error("Cannot load system rule for match result", error);
      setSystemRule(null);
    }
  };

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.referenceId === matchData?.id &&
        (event.action === "REFETCH_MATCH_DETAIL" ||
          event.action === "REFETCH_MATCH_EVENTS" ||
          event.action === "REFETCH_MATCH_STATS" ||
          event.action === "REFETCH_LINEUPS" ||
          event.referenceType === "MATCH" ||
          event.referenceType === "MATCH_EVENT" ||
          event.referenceType === "MATCH_STATS" ||
          event.referenceType === "MATCH_LINEUP")
      ) {
        reloadMatchData();
      }
    },
    [matchData?.id, reloadMatchData],
  );

  useRealtimeEvent(handleRealtimeEvent);

  // const handleUpdate = async () => {
  //   if (!matchData?.id) return;
  //   setLoading(true);
  //   try {
  //     const updatedMatch = {
  //       ...matchData,
  //       status: "FINISHED",
  //       homeScore: homeScore,
  //       awayScore: awayScore,
  //     };

  //     await MatchService.updateMatch(matchData.id, updatedMatch);
  //     if (onUpdateSuccess) {
  //       onUpdateSuccess();
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật kết quả trận đấu:", error);
  //     toast.error("Cập nhật thất bại. Vui lòng thử lại.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleAddEvent = async () => {
  //   if (!currentMatch?.id) return;

  //   if (!eventForm.teamId) {
  //     toast.warning("Vui lòng chọn đội.");
  //     return;
  //   }

  //   if (!eventForm.playerId) {
  //     toast.warning("Vui lòng chọn cầu thủ.");
  //     return;
  //   }

  //   if (eventForm.minute < 0 || eventForm.minute > 130) {
  //     toast.warning("Phút thi đấu không hợp lệ.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     await MatchService.createMatchEvent(currentMatch.id, {
  //       minute: eventForm.minute,
  //       extraMinute: eventForm.extraMinute,
  //       eventOrder: null,
  //       eventType: eventForm.eventType,
  //       goalType: eventForm.eventType === "GOAL" ? eventForm.goalType : null,
  //       teamId: eventForm.teamId,
  //       playerId: eventForm.playerId,
  //       playerInId:
  //         eventForm.eventType === "SUBSTITUTION" ? eventForm.playerInId : null,
  //       assistPlayerId:
  //         eventForm.eventType === "GOAL"
  //           ? eventForm.assistPlayerId || null
  //           : null,
  //       note: eventForm.note || null,
  //     });

  //     await reloadMatchData();

  //     setEventForm({
  //       eventType: "GOAL",
  //       goalType: "NORMAL",
  //       teamId: 0,
  //       playerId: 0,
  //       playerInId: 0,
  //       assistPlayerId: 0,
  //       minute: 1,
  //       extraMinute: null,
  //       note: "",
  //     });
  //   } catch (error) {
  //     console.error("Lỗi khi thêm sự kiện:", error);
  //     toast.error("Thêm sự kiện thất bại.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDeleteEvent = async (eventId: number) => {
    if (!currentMatch?.id) return;

    setDeletingEventId(eventId);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!currentMatch?.id || !deletingEventId) return;

    setLoading(true);

    try {
      await MatchService.deleteMatchEvent(currentMatch.id, deletingEventId);
      await reloadMatchData();
      toast.success("Đã xóa sự kiện.");
      setDeletingEventId(null);
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error);
      toast.error("Xóa sự kiện thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishMatch = async () => {
    if (!currentMatch?.id) return;

    setLoading(true);

    try {
      await MatchService.updateMatchStatus(currentMatch.id, "FINISHED");

      await reloadMatchData();

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      setFinishConfirmOpen(false);
      toast.success("Đã hoàn tất trận đấu.");
    } catch (error) {
      console.error("Lỗi khi hoàn tất trận đấu:", error);
      toast.error("Hoàn tất trận đấu thất bại.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitEvent = async (payload: MatchEventUpsertRequest) => {
    if (!currentMatch?.id) return;

    setLoading(true);

    try {
      await MatchService.createMatchEvent(currentMatch.id, payload);

      await reloadMatchData();

      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện:", error);
      toast.error("Thêm sự kiện thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManOfTheMatch = async () => {
    if (!currentMatch?.id) return;

    if (!selectedMotmPlayerId) {
      toast.warning("Vui lòng chọn cầu thủ xuất sắc nhất trận.");
      return;
    }

    setLoading(true);

    try {
      await MatchService.updateManOfTheMatch(
        currentMatch.id,
        Number(selectedMotmPlayerId),
      );
      await reloadMatchData();
      toast.success("Đã lưu cầu thủ xuất sắc nhất trận.");
    } catch (error) {
      console.error("Cannot update man of the match", error);
      toast.error(
        "Không thể lưu cầu thủ xuất sắc nhất trận. Vui lòng kiểm tra cầu thủ có thuộc hai đội thi đấu không.",
      );
    } finally {
      setLoading(false);
    }
  };

  const homeTeamName = matchData?.homeTeam?.name || "Đội chủ nhà";
  const awayTeamName = matchData?.awayTeam?.name || "Đội khách";
  const homeLogo = matchData?.homeTeam?.logo || "";
  const awayLogo = matchData?.awayTeam?.logo || "";

  // Lọc danh sách bàn thắng
  const goals = events.filter((e) => e.eventType === "GOAL");

  // Lấy stats của hai đội
  const homeStats = stats.find((s) => s.teamId === homeTeamId);
  const awayStats = stats.find((s) => s.teamId === awayTeamId);

  return (
    // <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#1b1c1a]/20 backdrop-blur-sm font-sans">
    <div className="font-sans">
      {/* Main Content */}
      <main className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        <div className="p-8 md:p-10 space-y-10 w-full overflow-y-auto max-h-[90vh]">
          {/* Breadcrumb & Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-black text-green-900 uppercase font-['Be_Vietnam_Pro']">
                  Cập nhật kết quả trận đấu
                </h2>
                <p className="text-gray-500 font-medium mt-1">
                  Ghi nhận thông số chi tiết của vòng đấu hiện tại
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSupervisorReportOpen(true)}
                  className="px-6 py-2 rounded-full border border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100"
                  disabled={loading}
                >
                  Báo cáo giám sát
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-gray-50"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => setFinishConfirmOpen(true)}
                  className="px-6 py-2 rounded-full bg-green-800 text-white font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Hoàn tất trận đấu"}
                </button>
              </div>
            </div>
          </div>

          {/* Score Hero Card */}
          <div className="bg-white rounded-2xl p-6 md:p-10 relative overflow-hidden flex items-center justify-between shadow-sm border border-black/5">
            <TeamInfo
              name={homeTeamName}
              role="Chủ nhà"
              logo={homeLogo}
              color="bg-green-50 text-green-700"
            />

            <div className="flex flex-col items-center gap-4 z-10">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-16 md:w-20 text-center text-4xl md:text-5xl font-black bg-gray-100 rounded-xl p-2">
                  {currentMatch?.homeScore ?? 0}
                </div>

                <span className="text-gray-300 text-3xl md:text-4xl font-bold">
                  :
                </span>

                <div className="w-16 md:w-20 text-center text-4xl md:text-5xl font-black bg-gray-100 rounded-xl p-2">
                  {currentMatch?.awayScore ?? 0}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-700 font-bold justify-center">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                  <span>Đang cập nhật</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {matchData?.league?.name} • Vòng {matchData?.round?.name}
                </p>
              </div>
            </div>

            <TeamInfo
              name={awayTeamName}
              role="Khách"
              logo={awayLogo}
              color="bg-indigo-50 text-indigo-700"
            />
          </div>

          {isLoadingData ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
          ) : (
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              {/* Left: Events & Timeline */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                <section className="bg-[#f5f3ef] rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                      <span className="material-symbols-outlined fill-1 text-green-700">
                        sports_soccer
                      </span>{" "}
                      Danh sách bàn thắng
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(true)}
                      className="text-green-700 font-bold text-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_circle
                      </span>
                      Thêm sự kiện
                    </button>
                  </div>
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <GoalRow
                        key={goal.id}
                        goal={goal}
                        team={goal.teamId === homeTeamId ? "home" : "away"}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                    {goals.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Chưa có bàn thắng nào được ghi nhận.
                      </p>
                    )}
                  </div>
                </section>

                <section className="bg-[#f5f3ef] rounded-2xl p-6 hidden md:block">
                  <h3 className="text-lg font-bold text-green-900 mb-8 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-700">
                      timeline
                    </span>{" "}
                    Timeline trận đấu trực quan
                  </h3>
                  <div className="relative pt-12 pb-16 px-4">
                    <div className="h-1.5 w-full bg-gray-300 rounded-full"></div>
                    {events.map((evt) => {
                      let typeLabel = "";
                      let typeVal = "";
                      let color = "bg-gray-400";

                      if (evt.eventType === "GOAL") {
                        typeLabel = "Goal";
                        typeVal = "goal";
                      } else if (evt.eventType === "YELLOW_CARD") {
                        typeLabel = "Thẻ vàng";
                        typeVal = "card";
                        color = "bg-yellow-400";
                      } else if (evt.eventType === "RED_CARD") {
                        typeLabel = "Thẻ đỏ";
                        typeVal = "card";
                        color = "bg-red-500";
                      } else {
                        return null; // substitution or others
                      }

                      return (
                        <TimelineMarker
                          key={evt.id}
                          minute={evt.minute}
                          label={typeLabel}
                          type={typeVal}
                          color={color}
                          team={evt.teamId === homeTeamId ? "home" : "away"}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Right: Stats & Notes */}
              <div className="col-span-12 md:col-span-3 space-y-6">
                <section className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                  <h3 className="text-sm font-black text-green-900 uppercase tracking-widest mb-4">
                    Cầu thủ xuất sắc nhất trận
                  </h3>
                  <div className="rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800">
                    Hiện tại:{" "}
                    {currentMatch?.manOfTheMatchPlayerName ||
                      "Chưa chọn cầu thủ"}
                  </div>
                  <select
                    value={selectedMotmPlayerId}
                    onChange={(event) =>
                      setSelectedMotmPlayerId(
                        event.target.value ? Number(event.target.value) : "",
                      )
                    }
                    className="mt-4 w-full rounded-xl border border-gray-100 bg-[#f5f3ef] px-3 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
                  >
                    <option value="">-- Chọn cầu thủ --</option>
                    {motmCandidates.map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {player.shirtNumber ? `#${player.shirtNumber} - ` : ""}
                        {player.playerName}
                        {player.teamName ? ` (${player.teamName})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSaveManOfTheMatch}
                    disabled={loading || !selectedMotmPlayerId}
                    className="mt-3 w-full rounded-full bg-green-800 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                  >
                    Lưu cầu thủ xuất sắc
                  </button>
                </section>

                <section className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                  <h3 className="text-sm font-black text-green-900 uppercase tracking-widest mb-6">
                    Thông số
                  </h3>
                  <div className="space-y-6">
                    <StatBar
                      label="Kiểm soát"
                      homeVal={homeStats?.possession || 0}
                      awayVal={awayStats?.possession || 0}
                    />
                    <StatRow
                      label="Sút bóng"
                      homeVal={homeStats?.shots || 0}
                      awayVal={awayStats?.shots || 0}
                    />
                    <StatRow
                      label="Trúng đích"
                      homeVal={homeStats?.shotsOnTarget || 0}
                      awayVal={awayStats?.shotsOnTarget || 0}
                    />
                    <StatRow
                      label="Phạm lỗi"
                      homeVal={homeStats?.fouls || 0}
                      awayVal={awayStats?.fouls || 0}
                    />
                    <StatRow
                      label="Phạt góc"
                      homeVal={homeStats?.corners || 0}
                      awayVal={awayStats?.corners || 0}
                      last
                    />
                  </div>
                </section>

                <section className="bg-green-50 border border-green-100 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-green-800 mb-4 uppercase">
                    Ghi chú trận đấu
                  </h3>
                  <textarea
                    className="w-full h-32 bg-white border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-green-800 mb-4 outline-none resize-none"
                    placeholder="Nhập nhận định chuyên môn..."
                  ></textarea>
                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-green-800 font-bold text-sm shadow-sm border border-green-100 hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      print
                    </span>{" "}
                    Xuất biên bản trận đấu
                  </button>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
      <MatchEventModal
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleSubmitEvent}
        loading={loading}
        homeTeamId={homeTeamId}
        homeTeamName={homeTeamName}
        awayTeamId={awayTeamId}
        awayTeamName={awayTeamName}
        lineups={lineups}
        allowedGoalTypes={
          systemRule?.allowedGoalTypes
            ?.split(",")
            .map((item) => item.trim())
            .filter((item): item is "NORMAL" | "PENALTY" | "OWN_GOAL" =>
              ["NORMAL", "PENALTY", "OWN_GOAL"].includes(item),
            )
        }
        maxGoalMinute={systemRule?.maxGoalMinute ?? null}
      />
      <MatchSupervisorReportModal
        open={isSupervisorReportOpen}
        matchId={currentMatch?.id ?? matchData?.id ?? null}
        onClose={() => setIsSupervisorReportOpen(false)}
        onSaved={reloadMatchData}
      />
      <ConfirmModal
        open={deletingEventId !== null}
        title="Xóa sự kiện"
        message="Bạn có chắc muốn xóa sự kiện này? Tỉ số và thống kê trận đấu có thể được cập nhật lại."
        confirmText="Xóa sự kiện"
        cancelText="Hủy"
        danger
        loading={loading}
        onConfirm={handleConfirmDeleteEvent}
        onClose={() => {
          if (!loading) setDeletingEventId(null);
        }}
      />
      <ConfirmModal
        open={finishConfirmOpen}
        title="Kết thúc trận đấu"
        message="Bạn có chắc chắn muốn hoàn tất trận đấu này? Hành động này sẽ đổi trạng thái trận sang đã kết thúc."
        confirmText="Kết thúc trận"
        cancelText="Hủy"
        danger
        loading={loading}
        onConfirm={handleFinishMatch}
        onClose={() => {
          if (!loading) setFinishConfirmOpen(false);
        }}
      />
    </div>
  );
};

// --- Sub-components ---

const TeamInfo = ({ name, role, logo, color }: any) => (
  <div className="flex flex-col items-center gap-3 w-1/3 z-10">
    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-gray-50 overflow-hidden">
      {logo ? (
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-gray-400 text-3xl">
          shield
        </span>
      )}
    </div>
    <span className="text-base md:text-xl font-black text-green-900 font-['Be_Vietnam_Pro'] text-center px-2 line-clamp-2">
      {name}
    </span>
    <span
      className={`${color} px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider`}
    >
      {role}
    </span>
  </div>
);

const GoalRow = ({
  goal,
  team,
  onDelete,
}: {
  goal: MatchEvent;
  team: "home" | "away";
  onDelete: (id: number) => void;
}) => (
  <div
    className={`bg-white p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 shadow-sm ${team === "away" ? "border-l-4 border-indigo-500" : "border-l-4 border-green-500"}`}
  >
    <div
      className={`w-8 h-8 md:w-10 md:h-10 shrink-0 ${team === "home" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"} flex items-center justify-center rounded-full`}
    >
      <span className="material-symbols-outlined fill-1 text-[18px] md:text-[24px]">
        sports_soccer
      </span>
    </div>
    <div className="flex-1 grid grid-cols-3 gap-2 md:gap-4">
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Cầu thủ
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {goal.playerName}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Thời điểm
        </p>
        <p className="text-xs md:text-sm font-bold">
          {goal.extraMinute != null
            ? `${goal.minute}+${goal.extraMinute}'`
            : `${goal.minute}'`}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Loại
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {goal.goalType === "OWN_GOAL"
            ? "Phản lưới nhà"
            : goal.goalType === "PENALTY"
              ? "Penalty"
              : "Bàn thắng thường"}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onDelete(goal.id)}
      className="text-gray-300 hover:text-red-500 shrink-0 p-1"
    >
      <span className="material-symbols-outlined text-[20px]">delete</span>
    </button>
  </div>
);

const TimelineMarker = ({
  minute,
  label,
  type,
  color = "bg-green-600",
  team,
  position,
}: any) => {
  const safeMinute = Math.min(Math.max(Number(minute) || 0, 0), 120);
  const leftPos = position || `${(safeMinute / 120) * 100}%`;
  return (
    <div
      className="absolute top-12 -translate-x-1/2 flex flex-col items-center"
      style={{ left: leftPos }}
    >
      <div
        className={`w-0.5 ${type === "goal" ? "h-10" : "h-6"} ${team === "away" ? "bg-indigo-500" : "bg-green-600"} mb-1`}
      ></div>
      {type === "goal" ? (
        <div
          className={`w-8 h-8 rounded-full ${team === "away" ? "bg-indigo-500" : "bg-green-600"} flex items-center justify-center text-white shadow-lg`}
        >
          <span className="material-symbols-outlined text-xs fill-1">
            sports_soccer
          </span>
        </div>
      ) : (
        <div
          className={`w-5 h-7 rounded-sm ${color} border border-gray-300 shadow-sm`}
        ></div>
      )}
      <span className="text-[10px] font-bold mt-1 whitespace-nowrap">
        {label} {minute}'
      </span>
    </div>
  );
};

const StatBar = ({ label, homeVal, awayVal }: any) => {
  const total = homeVal + awayVal;
  const homePct = total > 0 ? (homeVal / total) * 100 : 50;
  const awayPct = total > 0 ? (awayVal / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold font-['Be_Vietnam_Pro']">
        <span className="text-green-700">{homeVal}%</span>
        <span className="text-gray-400">{label}</span>
        <span className="text-indigo-600">{awayVal}%</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-green-600" style={{ width: `${homePct}%` }}></div>
        <div className="bg-indigo-500" style={{ width: `${awayPct}%` }}></div>
      </div>
    </div>
  );
};

const StatRow = ({ label, homeVal, awayVal, last = false }: any) => (
  <div
    className={`flex items-center justify-between py-1.5 ${last ? "" : "border-b border-gray-50"}`}
  >
    <span className="text-lg font-black text-green-700 w-8 text-center">
      {homeVal}
    </span>
    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-tighter flex-1 text-center">
      {label}
    </span>
    <span className="text-lg font-black text-indigo-600 w-8 text-center">
      {awayVal}
    </span>
  </div>
);

export default MatchResultUpdate;
