import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Dumbbell,
  MapPin,
  Search,
  Shield,
  Trophy,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import type { Coach } from "../../../model/CoachModel";
import type { League } from "../../../model/LeagueModel";
import type { Player } from "../../../model/Player";
import type { TeamModel } from "../../../model/TeamModel";
import CoachService from "../../../services/CoachService";
import LeagueService from "../../../services/LeagueService";
import PlayerService from "../../../services/PlayerService";
import SeasonService from "../../../services/SeasonService";
import TeamService from "../../../services/TeamService";
import { PhanTrang } from "../../../utils/PhanTrang";
import { Footer } from "../../../components/Footer/Footer_HomePage";
type ExploreTab =
  | "all"
  | "leagues"
  | "seasons"
  | "teams"
  | "players"
  | "coaches"
  | "referees";

type ExploreSeason = {
  id?: number;
  name?: string;
  year?: string;
  leagueId?: number | string | null;
  leagueName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
};

type ExploreReferee = {
  id?: number;
  name?: string;
  level?: string;
  status?: string;
};

type PageData<T> = {
  content?: T[];
  data?: T[] | PageData<T>;
};

const tabs: { key: ExploreTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "leagues", label: "Giải đấu" },
  { key: "seasons", label: "Mùa giải" },
  { key: "teams", label: "Đội bóng" },
  { key: "players", label: "Cầu thủ" },
  { key: "coaches", label: "Huấn luyện viên" },
  // { key: "referees", label: "Trọng tài" },
];

const playerPositionOptions = [
  { value: "", label: "Tất cả vị trí" },
  { value: "GK", label: "Thủ môn" },
  { value: "DF", label: "Hậu vệ" },
  { value: "MF", label: "Tiền vệ" },
  { value: "FW", label: "Tiền đạo" },
];

const defaultAvatar =
  "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-ff-ngau-91.jpg";
const defaultTeamLogo =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=240";
const TEAM_PAGE_SIZE = 12;
const PLAYER_PAGE_SIZE = 16;
const PERSON_PAGE_SIZE = 12;

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  const page = data as PageData<T> | undefined;
  if (Array.isArray(page?.content)) return page.content;
  if (Array.isArray(page?.data)) return page.data;
  if (page?.data && typeof page.data === "object")
    return readArray<T>(page.data);

  return [];
}

// Chuẩn hóa text.
function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Xử lý includes keyword.
function includesKeyword(keyword: string, values: unknown[]) {
  if (!keyword) return true;
  return values.some((value) => normalizeText(value).includes(keyword));
}

// Lấy numeric id.
function getNumericId(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

// Lấy number field.
function getNumberField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return undefined;
  return getNumericId((item as Record<string, unknown>)[field]);
}

// Lấy string field.
function getStringField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

// Lấy season title.
function getSeasonTitle(season: ExploreSeason) {
  return season.name || season.year || `Mùa giải #${season.id ?? "--"}`;
}

// Định dạng date.
function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

// Lấy season period.
function getSeasonPeriod(season: ExploreSeason) {
  const start = formatDate(season.startDate);
  const end = formatDate(season.endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "Đang cập nhật thời gian";
}

// Chuẩn hóa position group.
function normalizePositionGroup(position?: string | null) {
  const value = normalizeText(position);
  if (!value) return "";

  if (["gk", "goalkeeper", "thu mon"].some((term) => value.includes(term))) {
    return "GK";
  }
  if (
    ["df", "defender", "hau ve", "trung ve", "canh"].some((term) =>
      value.includes(term),
    )
  ) {
    return "DF";
  }
  if (
    ["mf", "midfielder", "tien ve", "winger"].some((term) =>
      value.includes(term),
    )
  ) {
    return "MF";
  }
  if (
    ["fw", "forward", "striker", "tien dao"].some((term) =>
      value.includes(term),
    )
  ) {
    return "FW";
  }

  return position?.toUpperCase() || "";
}

// Xử lý status label.
function statusLabel(value?: string | null) {
  if (!value) return "Đang cập nhật";
  if (value === "ACTIVE") return "Đang hoạt động";
  if (value === "INACTIVE") return "Tạm dừng";
  if (value === "FINISHED") return "Đã kết thúc";
  if (value === "ONGOING") return "Đang diễn ra";
  return value;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (Math.max(page, 1) - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

// Xử lý total pages.
function totalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

// Hiển thị SelectField.
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-100 bg-[#f8f7f3] px-4 text-sm font-bold text-gray-700 outline-none transition focus:border-[#1a6e38] focus:bg-white focus:ring-2 focus:ring-[#1a6e38]/15"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// Hiển thị EmptyState.
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm font-bold text-gray-500">
      {message}
    </div>
  );
}

// Tải loading state.
function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm"
        />
      ))}
    </div>
  );
}

// Hiển thị Section.
function Section({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f7ed] text-[#1a6e38]">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-950">{title}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {count} kết quả
            </p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

// Hiển thị CardButton.
function CardButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="min-h-40 w-full rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a6e38]/20 hover:shadow-md disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-gray-100 disabled:hover:shadow-sm"
    >
      {children}
    </button>
  );
}

// Hiển thị SectionPagination.
function SectionPagination({
  totalItems,
  pageSize,
  page,
  onPageChange,
}: {
  totalItems: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const pages = totalPages(totalItems, pageSize);

  if (pages <= 1) return null;

  return (
    <div className="border-t border-gray-100 pt-1">
      <PhanTrang
        tongSoTrang={pages}
        trangHienTai={page}
        xuLyTrang={onPageChange}
      />
    </div>
  );
}

// Hiển thị PublicExplorePage.
export default function PublicExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ExploreTab>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<ExploreSeason[]>([]);
  const [teams, setTeams] = useState<TeamModel[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [referees, setReferees] = useState<ExploreReferee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadWarnings, setLoadWarnings] = useState<string[]>([]);
  const [teamPage, setTeamPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);
  const [coachPage, setCoachPage] = useState(1);
  const [refereePage, setRefereePage] = useState(1);

  useEffect(() => {
    let mounted = true;

    // Tải explore data.
    const loadExploreData = async () => {
      setLoading(true);
      const warnings: string[] = [];

      const [leagueRes, seasonRes, teamRes, playerRes, coachRes] =
        await Promise.allSettled([
          LeagueService.getAllLeaguesNormalized(0, 200),
          SeasonService.getAllSeasons(0, 200),
          TeamService.getAllTeamsNormalized(0, 300),
          PlayerService.getAllPlayersNormalized(0, 500),
          CoachService.getAllCoachesNormalized(0, 300),
        ]);

      if (!mounted) return;

      if (leagueRes.status === "fulfilled") {
        setLeagues(readArray<League>(leagueRes.value));
      } else {
        warnings.push("Không tải được danh sách giải đấu.");
        console.warn(
          "PublicExplorePage: cannot load leagues",
          leagueRes.reason,
        );
      }

      if (seasonRes.status === "fulfilled") {
        setSeasons(readArray<ExploreSeason>(seasonRes.value.data));
      } else {
        warnings.push("Không tải được danh sách mùa giải.");
        console.warn(
          "PublicExplorePage: cannot load seasons",
          seasonRes.reason,
        );
      }

      if (teamRes.status === "fulfilled") {
        setTeams(readArray<TeamModel>(teamRes.value));
      } else {
        warnings.push("Không tải được danh sách đội bóng.");
        console.warn("PublicExplorePage: cannot load teams", teamRes.reason);
      }

      if (playerRes.status === "fulfilled") {
        setPlayers(readArray<Player>(playerRes.value));
      } else {
        warnings.push("Không tải được danh sách cầu thủ.");
        console.warn(
          "PublicExplorePage: cannot load players",
          playerRes.reason,
        );
      }

      if (coachRes.status === "fulfilled") {
        setCoaches(readArray<Coach>(coachRes.value));
      } else {
        warnings.push("Không tải được danh sách huấn luyện viên.");
        console.warn("PublicExplorePage: cannot load coaches", coachRes.reason);
      }

      console.warn(
        "PublicExplorePage: referee public list API is not available.",
      );
      setReferees([]);
      setLoadWarnings(warnings);
      setLoading(false);
    };

    loadExploreData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setTeamPage(1);
    setPlayerPage(1);
    setCoachPage(1);
    setRefereePage(1);
  }, [
    activeTab,
    keyword,
    selectedLeagueId,
    selectedSeasonId,
    selectedTeamId,
    selectedPosition,
  ]);

  const searchKey = normalizeText(keyword);
  const selectedLeagueNumericId = getNumericId(selectedLeagueId);
  const selectedSeasonNumericId = getNumericId(selectedSeasonId);
  const selectedTeamNumericId = getNumericId(selectedTeamId);

  const leagueNameById = useMemo(() => {
    const map = new Map<number, string>();
    leagues.forEach((league) => {
      if (league.id) map.set(league.id, league.name);
    });
    return map;
  }, [leagues]);

  const seasonCountByLeagueId = useMemo(() => {
    const map = new Map<number, number>();
    seasons.forEach((season) => {
      const leagueId = getNumericId(season.leagueId);
      if (!leagueId) return;
      map.set(leagueId, (map.get(leagueId) ?? 0) + 1);
    });
    return map;
  }, [seasons]);

  const filteredLeagues = useMemo(
    () =>
      leagues.filter((league) => {
        if (selectedLeagueNumericId && league.id !== selectedLeagueNumericId) {
          return false;
        }

        return includesKeyword(searchKey, [
          league.name,
          league.country,
          league.scale,
          getStringField(league, "description"),
        ]);
      }),
    [leagues, searchKey, selectedLeagueNumericId],
  );

  const filteredSeasons = useMemo(
    () =>
      seasons.filter((season) => {
        const leagueId = getNumericId(season.leagueId);
        if (selectedLeagueNumericId && leagueId !== selectedLeagueNumericId) {
          return false;
        }
        if (selectedSeasonNumericId && season.id !== selectedSeasonNumericId) {
          return false;
        }

        return includesKeyword(searchKey, [
          season.name,
          season.year,
          season.leagueName,
          leagueId ? leagueNameById.get(leagueId) : "",
          season.status,
        ]);
      }),
    [
      leagueNameById,
      searchKey,
      seasons,
      selectedLeagueNumericId,
      selectedSeasonNumericId,
    ],
  );

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => {
        if (selectedTeamNumericId && team.id !== selectedTeamNumericId) {
          return false;
        }
        if (
          selectedSeasonNumericId &&
          getNumberField(team, "seasonId") &&
          getNumberField(team, "seasonId") !== selectedSeasonNumericId
        ) {
          return false;
        }

        return includesKeyword(searchKey, [
          team.name,
          team.city,
          team.region,
          team.stadiumName,
          team.stadium,
          team.description,
        ]);
      }),
    [searchKey, selectedSeasonNumericId, selectedTeamNumericId, teams],
  );

  const filteredPlayers = useMemo(
    () =>
      players.filter((player) => {
        if (selectedTeamNumericId && player.teamId !== selectedTeamNumericId) {
          return false;
        }
        if (
          selectedSeasonNumericId &&
          getNumberField(player, "seasonId") &&
          getNumberField(player, "seasonId") !== selectedSeasonNumericId
        ) {
          return false;
        }
        if (
          selectedPosition &&
          ![player.position, player.detailPosition].some(
            (position) => normalizePositionGroup(position) === selectedPosition,
          )
        ) {
          return false;
        }

        return includesKeyword(searchKey, [
          player.name,
          player.teamName,
          player.position,
          player.detailPosition,
          player.nationality,
        ]);
      }),
    [
      players,
      searchKey,
      selectedPosition,
      selectedSeasonNumericId,
      selectedTeamNumericId,
    ],
  );

  const filteredCoaches = useMemo(
    () =>
      coaches.filter((coach) => {
        if (selectedTeamNumericId && coach.teamId !== selectedTeamNumericId) {
          return false;
        }
        if (
          selectedSeasonNumericId &&
          getNumberField(coach, "seasonId") &&
          getNumberField(coach, "seasonId") !== selectedSeasonNumericId
        ) {
          return false;
        }

        return includesKeyword(searchKey, [
          coach.name,
          coach.teamName,
          coach.nationality,
          coach.description,
          getStringField(coach, "role"),
        ]);
      }),
    [coaches, searchKey, selectedSeasonNumericId, selectedTeamNumericId],
  );

  const filteredReferees = useMemo(
    () =>
      referees.filter((referee) =>
        includesKeyword(searchKey, [
          referee.name,
          referee.level,
          referee.status,
        ]),
      ),
    [referees, searchKey],
  );

  const visibleTeams = useMemo(
    () => paginate(filteredTeams, teamPage, TEAM_PAGE_SIZE),
    [filteredTeams, teamPage],
  );

  const visiblePlayers = useMemo(
    () => paginate(filteredPlayers, playerPage, PLAYER_PAGE_SIZE),
    [filteredPlayers, playerPage],
  );

  const visibleCoaches = useMemo(
    () => paginate(filteredCoaches, coachPage, PERSON_PAGE_SIZE),
    [coachPage, filteredCoaches],
  );

  const visibleReferees = useMemo(
    () => paginate(filteredReferees, refereePage, PERSON_PAGE_SIZE),
    [filteredReferees, refereePage],
  );

  const hasAnyResult =
    filteredLeagues.length +
      filteredSeasons.length +
      filteredTeams.length +
      filteredPlayers.length +
      filteredCoaches.length +
      filteredReferees.length >
    0;

  // Xử lý show section.
  const showSection = (key: ExploreTab, count: number) =>
    activeTab === key || (activeTab === "all" && count > 0);

  return (
    <main className="min-h-screen bg-[#fbf9f5] text-gray-950">
      <div className="mx-auto max-w-[1440px] space-y-10 px-6 py-12 md:px-12">
        <header className="flex flex-col gap-6 border-b border-gray-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-widest text-green-700">
              Public explore
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
              Khám phá bóng đá
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-gray-500">
              Tra cứu nhanh giải đấu, mùa giải, đội bóng, cầu thủ, huấn luyện
              viên và trọng tài trong hệ thống.
            </p>
          </div>

          <label className="relative block w-full lg:w-[28rem]">
            <span className="sr-only">Tìm kiếm chung</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="h-12 w-full rounded-full border border-gray-100 bg-white py-3 pl-12 pr-4 text-sm font-bold text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1a6e38] focus:ring-4 focus:ring-[#1a6e38]/10"
              placeholder="Tìm giải, đội, cầu thủ..."
            />
          </label>
        </header>

        <section className="space-y-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                  activeTab === tab.key
                    ? "bg-[#1a6e38] text-white shadow-sm"
                    : "bg-[#f8f7f3] text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Giải đấu"
              value={selectedLeagueId}
              onChange={setSelectedLeagueId}
              options={[
                { value: "", label: "Tất cả giải đấu" },
                ...leagues
                  .filter((league) => league.id != null)
                  .map((league) => ({
                    value: String(league.id),
                    label: league.name,
                  })),
              ]}
            />

            <SelectField
              label="Mùa giải"
              value={selectedSeasonId}
              onChange={setSelectedSeasonId}
              options={[
                { value: "", label: "Tất cả mùa giải" },
                ...seasons
                  .filter((season) => season.id != null)
                  .map((season) => ({
                    value: String(season.id),
                    label: getSeasonTitle(season),
                  })),
              ]}
            />

            <SelectField
              label="Đội bóng"
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              options={[
                { value: "", label: "Tất cả đội bóng" },
                ...teams
                  .filter((team) => team.id != null)
                  .map((team) => ({
                    value: String(team.id),
                    label: team.name,
                  })),
              ]}
            />

            <SelectField
              label="Vị trí cầu thủ"
              value={selectedPosition}
              onChange={setSelectedPosition}
              options={playerPositionOptions}
            />
          </div>
        </section>

        {loadWarnings.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
            {loadWarnings.join(" ")}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : !hasAnyResult && activeTab === "all" ? (
          <EmptyState message="Không có dữ liệu phù hợp với bộ lọc hiện tại." />
        ) : (
          <div className="space-y-10">
            {showSection("leagues", filteredLeagues.length) && (
              <Section
                title="Giải đấu"
                count={filteredLeagues.length}
                icon={<Trophy size={18} />}
              >
                {filteredLeagues.length === 0 ? (
                  <EmptyState message="Không có giải đấu phù hợp." />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredLeagues.map((league) => (
                      <CardButton
                        key={league.id ?? league.name}
                        onClick={
                          league.id
                            ? () => navigate(`/leagues/${league.id}`)
                            : undefined
                        }
                      >
                        <div className="flex h-full flex-col justify-between gap-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                                {league.scale || "Giải đấu"}
                              </p>
                              <h3 className="mt-2 text-xl font-black text-gray-950">
                                {league.name || "Chưa đặt tên"}
                              </h3>
                            </div>
                            <Trophy className="text-[#1a6e38]" size={26} />
                          </div>
                          <div>
                            <p className="line-clamp-2 text-sm font-semibold leading-6 text-gray-500">
                              {getStringField(league, "description") ||
                                league.country ||
                                "Chưa có mô tả cho giải đấu này."}
                            </p>
                            <p className="mt-4 text-sm font-black text-gray-800">
                              {seasonCountByLeagueId.get(league.id ?? 0) ?? 0}{" "}
                              mùa giải
                            </p>
                          </div>
                        </div>
                      </CardButton>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {showSection("seasons", filteredSeasons.length) && (
              <Section
                title="Mùa giải"
                count={filteredSeasons.length}
                icon={<CalendarDays size={18} />}
              >
                {filteredSeasons.length === 0 ? (
                  <EmptyState message="Không có mùa giải phù hợp." />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredSeasons.map((season) => {
                      const leagueId = getNumericId(season.leagueId);
                      return (
                        <CardButton
                          key={season.id ?? getSeasonTitle(season)}
                          onClick={
                            season.id
                              ? () =>
                                  navigate(
                                    leagueId
                                      ? `/leagues/${leagueId}/seasons/${season.id}`
                                      : `/seasons/${season.id}`,
                                  )
                              : undefined
                          }
                        >
                          <div className="flex h-full flex-col justify-between gap-6">
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                                {season.leagueName ||
                                  (leagueId
                                    ? leagueNameById.get(leagueId)
                                    : "") ||
                                  "Giải đấu đang cập nhật"}
                              </p>
                              <h3 className="mt-2 text-xl font-black text-gray-950">
                                {getSeasonTitle(season)}
                              </h3>
                            </div>
                            <div className="space-y-3 text-sm font-bold text-gray-600">
                              <p>{getSeasonPeriod(season)}</p>
                              <span className="inline-flex rounded-full bg-[#e8f7ed] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                                {statusLabel(season.status)}
                              </span>
                            </div>
                          </div>
                        </CardButton>
                      );
                    })}
                  </div>
                )}
              </Section>
            )}

            {showSection("teams", filteredTeams.length) && (
              <Section
                title="Đội bóng"
                count={filteredTeams.length}
                icon={<Shield size={18} />}
              >
                {filteredTeams.length === 0 ? (
                  <EmptyState message="Không có đội bóng phù hợp." />
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {visibleTeams.map((team) => (
                        <CardButton
                          key={team.id ?? team.name}
                          onClick={
                            team.id
                              ? () => navigate(`/teams/${team.id}`)
                              : undefined
                          }
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={team.logo || defaultTeamLogo}
                              alt={team.name}
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-black text-gray-950">
                                {team.name || "Chưa đặt tên"}
                              </h3>
                              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-500">
                                <MapPin size={15} />
                                {team.stadiumName ||
                                  team.stadium ||
                                  "Sân nhà đang cập nhật"}
                              </p>
                              <p className="mt-3 text-sm font-semibold text-gray-500">
                                {team.city ||
                                  team.region ||
                                  "Thành phố đang cập nhật"}
                              </p>
                            </div>
                          </div>
                        </CardButton>
                      ))}
                    </div>
                    <SectionPagination
                      totalItems={filteredTeams.length}
                      pageSize={TEAM_PAGE_SIZE}
                      page={teamPage}
                      onPageChange={setTeamPage}
                    />
                  </div>
                )}
              </Section>
            )}

            {showSection("players", filteredPlayers.length) && (
              <Section
                title="Cầu thủ"
                count={filteredPlayers.length}
                icon={<Users size={18} />}
              >
                {filteredPlayers.length === 0 ? (
                  <EmptyState message="Không có cầu thủ phù hợp." />
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {visiblePlayers.map((player) => (
                        <CardButton
                          key={player.id ?? player.name}
                          onClick={
                            player.id
                              ? () => navigate(`/players/${player.id}`)
                              : undefined
                          }
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={player.avatar || defaultAvatar}
                              alt={player.name}
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-black text-gray-950">
                                {player.name || "Chưa đặt tên"}
                              </h3>
                              <p className="mt-2 text-sm font-bold text-gray-500">
                                {player.teamName || "Chưa có đội"}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#e8f7ed] px-3 py-1 text-xs font-black text-[#1a6e38]">
                                  {player.detailPosition ||
                                    player.position ||
                                    "Vị trí N/A"}
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">
                                  {player.nationality || "Quốc tịch N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardButton>
                      ))}
                    </div>
                    <SectionPagination
                      totalItems={filteredPlayers.length}
                      pageSize={PLAYER_PAGE_SIZE}
                      page={playerPage}
                      onPageChange={setPlayerPage}
                    />
                  </div>
                )}
              </Section>
            )}

            {showSection("coaches", filteredCoaches.length) && (
              <Section
                title="Huấn luyện viên"
                count={filteredCoaches.length}
                icon={<Dumbbell size={18} />}
              >
                {filteredCoaches.length === 0 ? (
                  <EmptyState message="Không có huấn luyện viên phù hợp." />
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {visibleCoaches.map((coach) => (
                        <CardButton
                          key={coach.id ?? coach.name}
                          onClick={
                            coach.id
                              ? () => navigate(`/coaches/${coach.id}`)
                              : undefined
                          }
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={coach.avatar || defaultAvatar}
                              alt={coach.name}
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-black text-gray-950">
                                {coach.name || "Chưa đặt tên"}
                              </h3>
                              <p className="mt-2 text-sm font-bold text-gray-500">
                                {coach.teamName || "Chưa có đội"}
                              </p>
                              <p className="mt-4 text-sm font-black text-[#1a6e38]">
                                {getStringField(coach, "role") ||
                                  coach.description ||
                                  "Huấn luyện viên"}
                              </p>
                            </div>
                          </div>
                        </CardButton>
                      ))}
                    </div>
                    <SectionPagination
                      totalItems={filteredCoaches.length}
                      pageSize={PERSON_PAGE_SIZE}
                      page={coachPage}
                      onPageChange={setCoachPage}
                    />
                  </div>
                )}
              </Section>
            )}

            {(activeTab === "referees" ||
              (activeTab === "all" && filteredReferees.length > 0)) && (
              <Section
                title="Trọng tài"
                count={filteredReferees.length}
                icon={<UserCheck size={18} />}
              >
                {filteredReferees.length === 0 ? (
                  <EmptyState message="Chưa có API danh sách trọng tài public hoặc chưa có dữ liệu trọng tài." />
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {visibleReferees.map((referee) => (
                        <CardButton
                          key={referee.id ?? referee.name}
                          onClick={
                            referee.id
                              ? () => navigate(`/referees/${referee.id}`)
                              : undefined
                          }
                        >
                          <div className="flex h-full flex-col justify-between gap-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#1a6e38]">
                                  {referee.level || "Trọng tài"}
                                </p>
                                <h3 className="mt-2 text-xl font-black text-gray-950">
                                  {referee.name || "Chưa đặt tên"}
                                </h3>
                              </div>
                              <UserRound className="text-[#1a6e38]" size={26} />
                            </div>
                            <p className="text-sm font-bold text-gray-500">
                              {statusLabel(referee.status)}
                            </p>
                          </div>
                        </CardButton>
                      ))}
                    </div>
                    <SectionPagination
                      totalItems={filteredReferees.length}
                      pageSize={PERSON_PAGE_SIZE}
                      page={refereePage}
                      onPageChange={setRefereePage}
                    />
                  </div>
                )}
              </Section>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
