import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AppLayout } from "../../../layouts/AppLayout";
import PlayerStatsService, {
  type PlayerStatsResponse,
} from "../../../services/PlayerStatsService";
import PlayerSuspensionService, {
  type PlayerSuspensionResponse,
} from "../../../services/PlayerSuspensionService";
import SeasonService from "../../../services/SeasonService";
import StandingService from "../../../services/StandingService";
import { extractApiErrorMessage } from "../../../utils/apiError";

type TabKey = "standings" | "scorers" | "cards" | "suspensions";

type SeasonOption = {
  id: number;
  name?: string;
  year?: string;
};

type StandingRow = {
  id?: number;
  rank?: number;
  teamName?: string;
  name?: string;
  clubName?: string;
  played?: number;
  matchesPlayed?: number;
  won?: number;
  wins?: number;
  drawn?: number;
  draws?: number;
  lost?: number;
  losses?: number;
  goalDifference?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
};

type PageData<T> = {
  content?: T[];
};

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "standings", label: "Bảng xếp hạng", icon: "leaderboard" },
  { key: "scorers", label: "Vua phá lưới", icon: "sports_soccer" },
  { key: "cards", label: "Thẻ phạt", icon: "style" },
  { key: "suspensions", label: "Cầu thủ bị treo giò", icon: "gpp_bad" },
];

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  return Array.isArray(page?.content) ? page.content : [];
}

function formatGoalDifference(row: StandingRow) {
  const value =
    row.goalDifference ??
    ((row.goalsFor ?? 0) - (row.goalsAgainst ?? 0));

  return value > 0 ? `+${value}` : String(value);
}

function teamInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("standings");
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | "">("");
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStatsResponse[]>([]);
  const [cards, setCards] = useState<PlayerStatsResponse[]>([]);
  const [suspensions, setSuspensions] = useState<PlayerSuspensionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await SeasonService.getAllSeasons(0, 100);
        const list = readArray<SeasonOption>(response.data);
        setSeasons(list);
        setSelectedSeasonId((current) => current || list[0]?.id || "");
      } catch (error) {
        console.error("Cannot load seasons", error);
        setErrorMessage(extractApiErrorMessage(error));
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeasonId) {
      setStandings([]);
      setTopScorers([]);
      setCards([]);
      setSuspensions([]);
      return;
    }

    const loadReportData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const seasonId = Number(selectedSeasonId);
        const [standingRes, scorerRes, cardRes, suspensionRes] =
          await Promise.all([
            StandingService.getAllStandings(seasonId),
            PlayerStatsService.getTopScorers(seasonId),
            PlayerStatsService.getCards(seasonId),
            PlayerSuspensionService.getBySeason(seasonId),
          ]);

        setStandings(readArray<StandingRow>(standingRes.data));
        setTopScorers(readArray<PlayerStatsResponse>(scorerRes.data));
        setCards(readArray<PlayerStatsResponse>(cardRes.data));
        setSuspensions(readArray<PlayerSuspensionResponse>(suspensionRes.data));
      } catch (error) {
        console.error("Cannot load report data", error);
        setErrorMessage(extractApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedSeasonId]);

  const selectedSeasonLabel = useMemo(() => {
    const season = seasons.find((item) => item.id === selectedSeasonId);
    return season?.name || season?.year || "Chưa chọn mùa giải";
  }, [seasons, selectedSeasonId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">
              Báo cáo giải đấu
            </h2>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Dữ liệu thống kê theo mùa giải: {selectedSeasonLabel}
            </p>
          </div>

          <select
            value={selectedSeasonId}
            onChange={(event) =>
              setSelectedSeasonId(
                event.target.value ? Number(event.target.value) : "",
              )
            }
            className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-green-700/20 md:w-72"
          >
            <option value="">-- Chọn mùa giải --</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name || season.year || `Mùa giải #${season.id}`}
              </option>
            ))}
          </select>
        </header>

        <section className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
                activeTab === tab.key
                  ? "bg-[#008C2F] text-white"
                  : "bg-[#f5f3ef] text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-gray-500">
              Đang tải dữ liệu báo cáo...
            </div>
          ) : activeTab === "standings" ? (
            <StandingsTable rows={standings} />
          ) : activeTab === "scorers" ? (
            <TopScorersTable rows={topScorers} />
          ) : activeTab === "cards" ? (
            <CardsTable rows={cards} />
          ) : (
            <SuspensionsTable rows={suspensions} />
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <DataTable
      emptyText="Chưa có dữ liệu bảng xếp hạng cho mùa giải này."
      headers={["Hạng", "Đội", "Trận", "Thắng", "Hòa", "Thua", "Hiệu số", "Điểm"]}
      rows={rows.map((row, index) => {
        const teamName = row.teamName || row.name || row.clubName || "Đội bóng";
        return [
          row.rank ?? index + 1,
          <TeamCell key="team" name={teamName} />,
          row.played ?? row.matchesPlayed ?? 0,
          row.won ?? row.wins ?? 0,
          row.drawn ?? row.draws ?? 0,
          row.lost ?? row.losses ?? 0,
          formatGoalDifference(row),
          row.points ?? 0,
        ];
      })}
    />
  );
}

function TopScorersTable({ rows }: { rows: PlayerStatsResponse[] }) {
  return (
    <DataTable
      emptyText="Chưa có dữ liệu vua phá lưới cho mùa giải này."
      headers={["Hạng", "Cầu thủ", "Đội", "Số bàn", "Kiến tạo"]}
      rows={rows.map((row, index) => [
        index + 1,
        row.playerName,
        row.teamName || "--",
        row.goals ?? 0,
        row.assists ?? 0,
      ])}
    />
  );
}

function CardsTable({ rows }: { rows: PlayerStatsResponse[] }) {
  return (
    <DataTable
      emptyText="Chưa có dữ liệu thẻ phạt cho mùa giải này."
      headers={["Cầu thủ", "Đội", "Thẻ vàng", "Thẻ đỏ"]}
      rows={rows.map((row) => [
        row.playerName,
        row.teamName || "--",
        row.yellowCards ?? 0,
        row.redCards ?? 0,
      ])}
    />
  );
}

function SuspensionsTable({ rows }: { rows: PlayerSuspensionResponse[] }) {
  return (
    <DataTable
      emptyText="Chưa có cầu thủ bị treo giò trong mùa giải này."
      headers={["Cầu thủ", "Lý do", "Trận gây án", "Trận bị treo", "Trạng thái"]}
      rows={rows.map((row) => [
        row.playerName,
        row.reason,
        row.sourceMatchId ?? "--",
        row.suspendedMatchId ?? "--",
        row.served ? "Đã thi hành" : "Đang treo giò",
      ])}
    />
  );
}

function DataTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-10 text-center text-sm font-bold text-gray-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 font-bold text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-xs font-black text-green-700">
        {teamInitials(name) || "CLB"}
      </span>
      <span>{name}</span>
    </div>
  );
}
