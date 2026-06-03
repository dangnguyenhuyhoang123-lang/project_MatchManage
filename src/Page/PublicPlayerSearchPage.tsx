import { useEffect, useState } from "react";
import PlayerService, {
  type PlayerSearchResponse,
} from "../services/PlayerService";
import SeasonService from "../services/SeasonService";
import TeamService from "../services/TeamService";
import { extractApiErrorMessage } from "../utils/apiError";

type SeasonOption = {
  id: number;
  name?: string;
  year?: string;
};

type TeamOption = {
  id?: number;
  name: string;
};

type PageData<T> = {
  content?: T[];
};

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  return Array.isArray(page?.content) ? page.content : [];
}

function playerTypeLabel(value?: string) {
  if (value === "DOMESTIC") return "Nội binh";
  if (value === "FOREIGN") return "Ngoại binh";
  return value || "--";
}

export default function PublicPlayerSearchPage() {
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [seasonId, setSeasonId] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [keyword, setKeyword] = useState("");
  const [playerType, setPlayerType] = useState("");
  const [players, setPlayers] = useState<PlayerSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [seasonRes, teamRes] = await Promise.all([
          SeasonService.getAllSeasons(0, 100),
          TeamService.getAllTeamsNormalized(0, 200),
        ]);
        const seasonList = readArray<SeasonOption>(seasonRes.data);
        setSeasons(seasonList);
        setTeams(readArray<TeamOption>(teamRes));
        setSeasonId((current) => current || seasonList[0]?.id || "");
      } catch (error) {
        console.error("Cannot load player search filters", error);
        setErrorMessage(extractApiErrorMessage(error));
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await PlayerService.searchPlayers({
          seasonId: seasonId ? Number(seasonId) : undefined,
          teamId: teamId ? Number(teamId) : undefined,
          keyword,
          playerType: playerType || undefined,
        });
        setPlayers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Cannot search players", error);
        setPlayers([]);
        setErrorMessage(extractApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [seasonId, teamId, keyword, playerType]);

  return (
    <main className="min-h-screen bg-[#fbf9f5] px-4 py-10 font-['Be_Vietnam_Pro'] text-gray-950 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#008C2F]">
            Public players
          </p>
          <h1 className="text-4xl font-black tracking-tight">
            Tra cứu cầu thủ
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-gray-500">
            Tìm cầu thủ theo mùa giải, đội bóng, tên và loại cầu thủ.
          </p>
        </header>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SelectField
              label="Mùa giải"
              value={seasonId}
              onChange={(value) => setSeasonId(value ? Number(value) : "")}
              options={[
                { value: "", label: "Tất cả mùa giải" },
                ...seasons.map((season) => ({
                  value: String(season.id),
                  label: season.name || season.year || `Mùa giải #${season.id}`,
                })),
              ]}
            />

            <SelectField
              label="Đội bóng"
              value={teamId}
              onChange={(value) => setTeamId(value ? Number(value) : "")}
              options={[
                { value: "", label: "Tất cả đội" },
                ...teams
                  .filter((team) => team.id != null)
                  .map((team) => ({
                    value: String(team.id),
                    label: team.name,
                  })),
              ]}
            />

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                Tên cầu thủ
              </span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
                placeholder="Nhập tên cầu thủ..."
              />
            </label>

            <SelectField
              label="Loại cầu thủ"
              value={playerType}
              onChange={setPlayerType}
              options={[
                { value: "", label: "Tất cả" },
                { value: "DOMESTIC", label: "Nội binh" },
                { value: "FOREIGN", label: "Ngoại binh" },
              ]}
            />
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-gray-500">
              Đang tìm cầu thủ...
            </div>
          ) : players.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-10 text-center text-sm font-bold text-gray-500">
              Không có cầu thủ phù hợp bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                    <th className="px-4 py-3">STT</th>
                    <th className="px-4 py-3">Cầu thủ</th>
                    <th className="px-4 py-3">Đội</th>
                    <th className="px-4 py-3">Loại cầu thủ</th>
                    <th className="px-4 py-3">Quốc tịch</th>
                    <th className="px-4 py-3">Tổng bàn thắng</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={`${player.playerId}-${index}`}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-4 py-4 font-black text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 font-black text-gray-900">
                        {player.playerName}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-600">
                        {player.teamName || "--"}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-600">
                        {playerTypeLabel(player.playerType)}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-600">
                        {player.nationality || "--"}
                      </td>
                      <td className="px-4 py-4 font-black text-green-700">
                        {player.totalGoals ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
